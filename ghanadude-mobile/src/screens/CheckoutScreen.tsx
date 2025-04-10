import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Animated, Easing,
} from 'react-native';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { checkoutOrder } from '../services/Checkout';
import { fetchUserProfile, fetchRewards, updateUserProfile } from '../services/UserService';
import { selectCartItems, clearCart, removeFromBasket } from '../redux/slices/basketSlice';
import { selectUser } from '../redux/slices/authSlice';
import { selectDesign, clearDesign } from '../redux/slices/designSlice';
import PayFast from './PayFast';
import { API_BASE_URL } from '../services/AuthService';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import InfoTooltip from '../components/InfoTooltip';

const BRAND_LOGO_PRICE = 50;
const CUSTOM_DESIGN_PRICE = 100;

type NavigationProp = StackNavigationProp<HomeStackParamList, 'CheckoutScreen'>;

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
  const {
    brandLogo,
    customDesign,
    brandLogoQty = 1,
    customDesignQty = 1,
  } = useSelector(selectDesign);

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
  const [rewardBalance, setRewardBalance] = useState(0);
  const [rewardApplied, setRewardApplied] = useState(0);

  const rewardAlertAnim = useRef(new Animated.Value(0)).current;

  // Price Calculations
  const productTotal = cartItems.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
  const logoTotal = brandLogo ? BRAND_LOGO_PRICE * brandLogoQty : 0;
  const designTotal = customDesign ? CUSTOM_DESIGN_PRICE * customDesignQty : 0;
  const totalPrice = productTotal + logoTotal + designTotal;

  const discountedPrice = totalPrice >= 1000 ? totalPrice - Math.min(rewardBalance, totalPrice) : totalPrice;
  const finalPrice = parseFloat(discountedPrice.toFixed(2));

  const itemNames = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');

  const ensureAuth = () => {
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return null;
    }
    return { user };
  };

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
    const auth = ensureAuth();
    if (!auth) return;

    const loadData = async () => {
      try {
        const profile = await fetchUserProfile(auth.user.user_id);
        const rewardRes = await fetchRewards(auth.user.user_id);

        setForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone_number: profile.profile?.phone_number || '',
          address: profile.profile?.address || '',
          city: profile.profile?.city || '',
          postal_code: profile.profile?.postal_code || '',
          country: profile.profile?.country || '',
        });

        const balance = parseFloat(rewardRes.reward_balance || '0');
        setRewardBalance(balance);

        if (totalPrice >= 1000 && balance > 0) {
          const applied = Math.min(balance, totalPrice);
          setRewardApplied(applied);

          Animated.timing(rewardAlertAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      } catch {
        Alert.alert('Error', 'Failed to load profile or rewards.');
      }
    };

    loadData();
  }, []);

  const initiatePayment = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    setLoading(true);
    try {
      const payload = {
        user_id: auth.user.user_id,
        total_price: finalPrice,
        reward_applied: rewardApplied,
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
      };

      const hasDesignUpload = brandLogo || customDesign;
      let dataToSend = payload;

      if (hasDesignUpload) {
        const formData = new FormData();
        for (const key in payload) {
          if (key === 'items') {
            formData.append('items', JSON.stringify(payload.items));
          } else {
            formData.append(key, String((payload as any)[key]));
          }
        }

        if (brandLogo) {
          formData.append('brand_logo', {
            uri: brandLogo,
            name: 'brand_logo.png',
            type: 'image/png',
          } as any);
          formData.append('brand_logo_qty', String(brandLogoQty));
        }

        if (customDesign) {
          formData.append('custom_design', {
            uri: customDesign,
            name: 'custom_design.jpg',
            type: 'image/jpeg',
          } as any);
          formData.append('custom_design_qty', String(customDesignQty));
        }

        dataToSend = formData;
      }

      const res = await checkoutOrder(dataToSend);
      setOrderId(res.order_id);
      setPayFastVisible(true);
    } catch (err: any) {
      const error = err?.response?.data;
      if (error?.product_id && error?.product_name) {
        Alert.alert(
          'Insufficient Stock',
          `🚫 Sorry, ${error.product_name} is out of stock and needs to be removed from your cart.`,
          [
            {
              text: 'OK',
              onPress: () => {
                dispatch(removeFromBasket({ id: error.product_id, selectedSize: '', isBulk: false }));
                navigation.navigate('Cart');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', error?.error || 'Checkout failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = async (reference?: string) => {
    const auth = ensureAuth();
    if (!auth || !orderId || !reference) return;

    try {
      await fetch(`${API_BASE_URL}/order/orders/${orderId}/update-status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Processing' }),
      });

      await updateUserProfile(auth.user.user_id, {
        name: `${form.first_name} ${form.last_name}`,
        ...form,
      });

      dispatch(clearCart());
      dispatch(clearDesign());
      setPayFastVisible(false);
      navigation.navigate('SuccessScreen', { order_id: orderId });
    } catch {
      Alert.alert('Error', 'Failed to finalize payment.');
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
            tw`border p-3 rounded-lg mb-3 text-base`,
            editableFields[field] ? tw`bg-white` : tw`bg-gray-200`,
          ]}
        />
      ))}

      {rewardApplied > 0 && (
        <Animated.View
          style={[
            tw`bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg mt-4`,
            {
              opacity: rewardAlertAnim,
              transform: [
                {
                  translateY: rewardAlertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={tw`flex-row justify-between items-start`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-yellow-800 font-semibold`}>
                🎉 R{rewardApplied.toFixed(2)} from your reward balance has been applied!
              </Text>
              <Text style={tw`text-yellow-700 mt-1`}>
                You're paying R{finalPrice.toFixed(2)} after reward deduction.
              </Text>
              <Text style={tw`text-yellow-700 mt-1 text-sm`}>
                Remaining Reward Balance: R{(rewardBalance - rewardApplied).toFixed(2)}
              </Text>
            </View>
            <InfoTooltip text="Rewards only apply to orders of R1000 or more." />
          </View>
        </Animated.View>
      )}

      <View style={tw`bg-gray-50 p-4 rounded-lg mt-4`}>
        <Text style={tw`text-base`}>🛍️ Products: R{productTotal.toFixed(2)}</Text>
        {brandLogo && (
          <Text style={tw`text-base`}>🎨 Brand Logo: R{BRAND_LOGO_PRICE} × {brandLogoQty} = R{(BRAND_LOGO_PRICE * brandLogoQty).toFixed(2)}</Text>
        )}
        {customDesign && (
          <Text style={tw`text-base`}>🧵 Custom Design: R{CUSTOM_DESIGN_PRICE} × {customDesignQty} = R{(CUSTOM_DESIGN_PRICE * customDesignQty).toFixed(2)}</Text>
        )}
        {rewardApplied > 0 && (
          <Text style={tw`text-green-700 mt-2`}>
            🎁 Reward Discount: -R{rewardApplied.toFixed(2)}
          </Text>
        )}
        <View style={tw`mt-2 border-t border-gray-300 pt-2`}>
          <Text style={tw`text-lg font-bold`}>
            Final Total: R{finalPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={useCurrentLocation} style={tw`bg-blue-600 py-3 mt-4 rounded-lg`}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={tw`text-white text-center font-bold`}>📍 Use Current Location</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={initiatePayment} style={tw`bg-green-600 py-3 mt-3 rounded-lg`}>
        <Text style={tw`text-white text-center font-bold`}>
          💳 Pay R{finalPrice.toFixed(2)}
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
            amount: finalPrice,
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
