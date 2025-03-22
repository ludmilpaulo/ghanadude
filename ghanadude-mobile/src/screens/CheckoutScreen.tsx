import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import PayFast from './PayFast';
import { checkoutOrder } from '../services/Checkout';
import { fetchUserProfile, updateUserProfile } from '../services/UserService';
import { getUserCoupons } from '../services/CouponService';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { selectUser } from '../redux/slices/authSlice';
import { API_BASE_URL } from '../services/AuthService';

type CheckoutScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'CheckoutScreen'>;

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);

  const [payFastVisible, setPayFastVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.quantity * Number(item.price),
    0
  );

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
  });

  const [editableFields, setEditableFields] = useState<Record<keyof typeof form, boolean>>({
    first_name: true,
    last_name: true,
    email: true,
    phone_number: true,
    address: true,
    city: true,
    postal_code: true,
    country: true,
  });

  const discountedPrice = selectedCoupon
    ? Math.max(0, totalPrice - Number(selectedCoupon.value))
    : totalPrice;

  const itemNames = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await fetchUserProfile(user.user_id);
        setForm({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          city: profile.city || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
        });

        const couponRes = await getUserCoupons(user.user_id); // Using user_id
        const now = new Date();
        const validCoupons = couponRes
          .filter((c: any) => !c.is_redeemed && new Date(c.expires_at) > now)
          .sort((a: any, b: any) => Number(b.value) - Number(a.value));

        setCoupons(validCoupons);
        if (validCoupons.length > 0) {
          setSelectedCoupon(validCoupons[0]); // auto-select best
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile or coupons');
      }
    };

    load();
  }, [user.user_id]);

  const handleChange = (name: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const useCurrentLocation = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is needed.');
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const geo = await Location.reverseGeocodeAsync(location.coords);
    if (geo.length > 0) {
      const place = geo[0];
      setForm(prev => ({
        ...prev,
        address: `${place.streetNumber || ''} ${place.street || ''}`.trim(),
        city: place.city || '',
        postal_code: place.postalCode || '',
        country: place.country || '',
      }));

      setEditableFields(prev => ({
        ...prev,
        address: false,
        city: false,
        postal_code: false,
        country: false,
      }));
    } else {
      Alert.alert('Error', 'Unable to determine address.');
    }
    setLoading(false);
  };

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const checkoutData = {
        user_id: user.user_id,
        total_price: discountedPrice,
        coupon_code: selectedCoupon?.code || null,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
        payment_method: 'payfast',
        status: 'pending',
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
      };
      const res = await checkoutOrder(checkoutData);
      setOrderId(res.order_id);
      setPayFastVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Checkout initiation failed.');
    }
    setLoading(false);
  };

  const handlePaymentClose = async (reference?: string) => {
    setPayFastVisible(false);
    if (reference && orderId) {
      const finalCheckoutData = {
        user_id: user.user_id,
        total_price: discountedPrice,
        coupon_code: selectedCoupon?.code || null,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
        payment_method: 'payfast',
        status: 'completed',
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
        phone_number: form.phone_number,
      };

      try {
        await checkoutOrder(finalCheckoutData);
        await updateUserProfile(user.user_id, form); // No token required
        dispatch(clearCart());
        navigation.navigate('SuccessScreen', { order_id: orderId });
      } catch (error) {
        Alert.alert('Error', 'Checkout confirmation failed.');
      }
    } else {
      Alert.alert('Payment Cancelled', 'Payment was cancelled or unsuccessful.');
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 p-4`}>
      <Text style={tw`text-2xl font-bold text-center mb-4`}>Checkout 🛒</Text>

      {(Object.keys(form) as (keyof typeof form)[]).map((field) => (
        <TextInput
          key={field}
          placeholder={field.replace('_', ' ').toUpperCase()}
          value={form[field]}
          editable={editableFields[field]}
          onChangeText={(text) => handleChange(field, text)}
          style={[
            tw`border p-3 rounded-lg mb-3`,
            editableFields[field] ? tw`bg-white` : tw`bg-gray-200`,
          ]}
        />
      ))}

      {coupons.length > 0 && (
        <View style={tw`my-4`}>
          <Text style={tw`text-lg font-bold mb-2`}>🎟️ Applied Coupon</Text>
          {coupons.map((coupon: any) => (
            <TouchableOpacity
              key={coupon.code}
              onPress={() => setSelectedCoupon(coupon)}
              style={[
                tw`p-3 rounded-lg mb-2 border`,
                selectedCoupon?.code === coupon.code ? tw`border-green-600 bg-green-100` : tw`border-gray-300`
              ]}
            >
              <Text style={tw`text-base font-semibold`}>{coupon.code}</Text>
              <Text style={tw`text-sm text-gray-600`}>
                R{coupon.value} off • Expires {new Date(coupon.expires_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={tw`mb-4`}>
        <Text style={tw`text-lg`}>
          🧾 Total: <Text style={tw`line-through text-gray-500`}>R{totalPrice.toFixed(2)}</Text>
        </Text>
        <Text style={tw`text-2xl font-bold text-green-700`}>
          💰 Pay: R{discountedPrice.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity onPress={useCurrentLocation} style={tw`bg-blue-600 py-3 rounded-lg mt-3`}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={tw`text-white text-center font-bold`}>📍 Use Current Location</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={initiatePayment} style={tw`bg-green-600 py-3 rounded-lg my-3`}>
        <Text style={tw`text-white text-center font-bold`}>
          💳 Pay R{discountedPrice.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {payFastVisible && orderId && (
        <PayFast
          merchantId="10037687"
          merchantKey="t9k4qun47sejo"
          passPhrase=""
          sandbox={true}
          notifyUrl={`${API_BASE_URL}/order/notify/`}
          signature={false}
          transactionDetails={{
            customerFirstName: form.first_name,
            customerLastName: form.last_name,
            customerEmailAddress: form.email,
            customerPhoneNumber: form.phone_number,
            reference: `ORDER_${orderId}`,
            amount: discountedPrice,
            itemName: itemNames,
            itemDescription: 'Checkout Payment',
          }}
          isVisible={payFastVisible}
          onClose={handlePaymentClose}
        />
      )}
    </ScrollView>
  );
};

export default CheckoutScreen;
