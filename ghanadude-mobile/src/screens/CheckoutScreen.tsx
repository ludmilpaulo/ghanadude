import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { checkoutOrder } from '../services/Checkout';
import { fetchUserProfile, updateUserProfile } from '../services/UserService';
import { getUserCoupons } from '../services/CouponService';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { selectUser } from '../redux/slices/authSlice';
import { selectDesign, clearDesign } from '../redux/slices/designSlice';
import PayFast from './PayFast';
import { API_BASE_URL } from '../services/AuthService';
import { HomeStackParamList } from '../navigation/HomeNavigator';

type NavigationProp = StackNavigationProp<HomeStackParamList, 'CheckoutScreen'>;

interface Coupon {
  code: string;
  value: number;
  expires_at: string;
  is_redeemed: boolean;
}

interface FormFields {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

const CheckoutScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const design = useSelector(selectDesign);

  const [form, setForm] = useState<FormFields>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
  });

  const [editableFields, setEditableFields] = useState<Record<keyof FormFields, boolean>>({
    first_name: true,
    last_name: true,
    email: true,
    phone_number: true,
    address: true,
    city: true,
    postal_code: true,
    country: true,
  });

  const [payFastVisible, setPayFastVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
  const discountedPrice = selectedCoupon ? Math.max(0, totalPrice - Number(selectedCoupon.value)) : totalPrice;
  const itemNames = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');

  const handleChange = (field: keyof FormFields, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const useCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync(location.coords);
      if (geo) {
        setForm(prev => ({
          ...prev,
          address: `${geo.streetNumber || ''} ${geo.street || ''}`.trim(),
          city: geo.city || '',
          postal_code: geo.postalCode || '',
          country: geo.country || '',
        }));
        setEditableFields(prev => ({
          ...prev,
          address: false,
          city: false,
          postal_code: false,
          country: false,
        }));
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
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

        const res = await getUserCoupons(user.user_id);
        const valid: Coupon[] = res
          .filter((c: Coupon) => !c.is_redeemed && new Date(c.expires_at) > new Date())
          .sort((a: Coupon, b: Coupon) => b.value - a.value);

        setCoupons(valid);
        if (valid.length > 0) setSelectedCoupon(valid[0]); // Auto-apply highest value
      } catch {
        Alert.alert('Error', 'Failed to load profile or coupons.');
      }
    };

    loadData();
  }, [user.user_id]);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const res = await checkoutOrder({
        user_id: user.user_id,
        total_price: discountedPrice,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
        payment_method: 'payfast',
        status: 'pending',
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          is_bulk: item.isBulk || false,
        })),
        coupon_code: selectedCoupon?.code,
      });

      setOrderId(res.order_id);
      setPayFastVisible(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; missing_fields?: string[] } } };
      const errorMsg = error.response?.data?.error || 'Checkout initiation failed.';
      const missingFields = error.response?.data?.missing_fields;

      if (missingFields) {
        Alert.alert('Missing Fields', `Please complete: ${missingFields.join(', ')}`);
      } else if (errorMsg.includes('Insufficient stock')) {
        Alert.alert(
          'Stock Error',
          errorMsg,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove and Continue',
              style: 'destructive',
              onPress: () => {
                dispatch(clearCart());
                navigation.navigate('HomeScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = async (reference?: string) => {
    if (!reference || !orderId) return;

    const formData = new FormData();
    formData.append('user_id', user.user_id.toString());
    formData.append('order_id', orderId.toString());
    formData.append('total_price', discountedPrice.toString());
    if (selectedCoupon) {
      formData.append('coupon_code', selectedCoupon.code);
    }

    cartItems.forEach((item, idx) => {
      formData.append(`items[${idx}][id]`, item.id.toString());
      formData.append(`items[${idx}][size]`, item.selectedSize);
      formData.append(`items[${idx}][quantity]`, item.quantity.toString());
      formData.append(`items[${idx}][is_bulk]`, item.isBulk ? 'true' : 'false');
    });

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (design.brandLogo) {
      formData.append('brand_logo', {
        uri: design.brandLogo,
        type: 'image/png',
        name: 'brand_logo.png',
      } as unknown as Blob);
      
    }

    if (design.customDesign) {
      formData.append('custom_design', {
        uri: design.customDesign,
        type: 'image/jpeg',
        name: 'custom_design.jpg',
      } as unknown as Blob);
      
    }

    try {
      await checkoutOrder(formData);
      await updateUserProfile(user.user_id, form);
      dispatch(clearCart());
      dispatch(clearDesign());
      navigation.navigate('SuccessScreen', { order_id: orderId });
    } catch {
      Alert.alert('Error', 'Checkout confirmation failed.');
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-2xl font-bold text-center mb-4`}>Checkout 🛒</Text>

      {(Object.keys(form) as (keyof FormFields)[]).map((field) => (
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
          <Text style={tw`text-lg font-bold mb-2`}>🎟️ Available Coupons</Text>
          {coupons.map((coupon) => (
            <TouchableOpacity
              key={coupon.code}
              onPress={() => setSelectedCoupon(coupon)}
              style={[
                tw`p-3 rounded-lg mb-2 border`,
                selectedCoupon?.code === coupon.code
                  ? tw`border-green-600 bg-green-100`
                  : tw`border-gray-300`,
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

      <TouchableOpacity onPress={useCurrentLocation} style={tw`bg-blue-600 py-3 rounded-lg mb-3`}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={tw`text-white text-center font-bold`}>📍 Use Current Location</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={initiatePayment} style={tw`bg-green-600 py-3 rounded-lg`}>
        <Text style={tw`text-white text-center font-bold`}>
          💳 Pay R{discountedPrice.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {payFastVisible && orderId && (
        <PayFast
          merchantId="10037687"
          merchantKey="t9k4qun47sejo"
          sandbox
          notifyUrl={`${API_BASE_URL}/order/notify/`}
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
