import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  Modal,
  Animated,
} from 'react-native';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

import { checkoutOrder } from '../services/Checkout';
import { fetchUserProfile, fetchRewards, updateUserProfile } from '../services/UserService';
import { fetchSiteSettings, SiteSetting } from '../services/SiteSettingService';
import { getLatLngFromAddress, haversineDistance } from '../utils/geoUtils';
import { appendImageToFormData, RNImageFile } from '../utils/formDataUtils';
import { getCountryCallingCode } from 'libphonenumber-js';
import { selectUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { selectDesign, clearDesign } from '../redux/slices/designSlice';

import { API_BASE_URL } from '../services/AuthService';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import PayFast from './PayFast';

import CheckoutForm, { FormFields } from '../components/checkout/CheckoutForm';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import DeliverySelector from '../components/checkout/DeliverySelector';
import InfoTooltip from '../components/InfoTooltip';

type NavigationProp = StackNavigationProp<HomeStackParamList, 'CheckoutScreen'>;

const CheckoutScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const design = useSelector(selectDesign);

  const [form, setForm] = useState<FormFields>({
    first_name: '', last_name: '', email: '', phone_number: '',
    address: '', city: '', postal_code: '', country: '',
  });

  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [rewardApplied, setRewardApplied] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [bulkOrderId, setBulkOrderId] = useState<number | null>(null);
  const [payFastVisible, setPayFastVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number>(0);
  const [deliveryFeeLoading, setDeliveryFeeLoading] = useState<boolean>(false);



  const scaleAnim = useRef(new Animated.Value(0)).current;

  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);

  const ensureAuth = () => {
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return null;
    }
    return { user };
  };

  const getDistanceKm = async () => {
    if (!form.address || !form.city || !siteSettings) return 0;
    try {
      const userFullAddress = `${form.address}, ${form.city}, ${form.country}`;
      const storeCoords = await getLatLngFromAddress(siteSettings.address);
      const userCoords = await getLatLngFromAddress(userFullAddress);
      if (!storeCoords || !userCoords) return 0;
      return haversineDistance(storeCoords, userCoords);
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const auth = ensureAuth();
    if (!auth) return;
    const load = async () => {
      try {
        const [profile, rewards, settings] = await Promise.all([
          fetchUserProfile(auth.user.user_id),
          fetchRewards(auth.user.user_id),
          fetchSiteSettings(),
        ]);
        setSiteSettings({
          brand_price: settings.brand_price,
          custom_price: settings.custom_price,
          delivery_fee: settings.delivery_fee,
          estimatedWeight: settings.estimatedWeight,
          internationalRate: settings.internationalRate,
          vat_percentage: settings.vat_percentage,
          address: settings.address,
          country: settings.country,
        });
        setForm({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.profile.phone_number || '',
          address: profile.profile.address || '',
          city: profile.profile.city || '',
          postal_code: profile.profile.postal_code || '',
          country: profile.profile.country || '',
        });
        const balance = parseFloat(rewards.reward_balance || '0');
        setRewardBalance(balance);
        const subtotal = calculateSubtotal();
        if (subtotal >= 1000 && balance > 0) {
          setRewardApplied(Math.min(balance, subtotal));
        }
      } catch {
        Alert.alert('Error', 'Failed to load profile or site settings');
      }
    };
    load();
  }, []);

  useEffect(() => {
    const shouldCalculate =
      orderType === 'delivery' &&
      siteSettings &&
      form.address.trim() !== '' &&
      form.city.trim() !== '' &&
      form.country.trim() !== '' &&
      cartItems.length > 0;
  
    const autoUpdateDeliveryFee = async () => {
      if (shouldCalculate) {
        setDeliveryFeeLoading(true);
        const fee = await calculateDeliveryFee();
        setCalculatedDeliveryFee(fee);
        setDeliveryFeeLoading(false);
      } else {
        setCalculatedDeliveryFee(0);
      }
    };
  
    autoUpdateDeliveryFee();
  }, [orderType, siteSettings, form.address, form.city, form.country, cartItems]);
  
  

  useEffect(() => {
    if (showSuccess && (orderId !== null || bulkOrderId !== null)) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start(() => {
        setTimeout(() => {
          navigation.navigate('SuccessScreen', {
            ...(orderId !== null && { order_id: orderId }),
            ...(bulkOrderId !== null && { bulk_order_id: bulkOrderId }),
          });
        }, 1500);
      });
    }
  }, [showSuccess]);

  const calculateSubtotal = () => {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * parseFloat(String(item.price)), 0);
  
    const brandDesignCost = design.brandLogo
      ? (siteSettings?.brand_price || 0) * (design.brandLogoQty || 1)
      : 0;
  
    const customDesignCost = design.customDesign
      ? (siteSettings?.custom_price || 0) * (design.customDesignQty || 1)
      : 0;
  
    return cartTotal + brandDesignCost + customDesignCost;
  };
  
  const calculateVAT = (amount: number) =>
    siteSettings ? parseFloat(((amount * siteSettings.vat_percentage) / 100).toFixed(2)) : 0;

  const calculateDeliveryFee = async (): Promise<number> => {
    if (orderType === 'collection' || !siteSettings) return 0;
  
    const isInternational = form.country.trim().toLowerCase() !== 'south africa';
    const { estimatedWeight, internationalRate, delivery_fee } = siteSettings;
  
    // Total item count
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
    // Calculate weight only if 10 or more items, charge every 5 items
    const weightChargeKg = totalItems >= 10 ? Math.floor((totalItems - 5) / 5) : 0;
  
    if (isInternational) {
      const internationalFee = weightChargeKg * internationalRate;
      console.log('🌍 International Delivery Fee Breakdown:', {
        totalItems,
        weightChargeKg,
        internationalRate,
        deliveryFee: internationalFee.toFixed(2),
      });
      return parseFloat(internationalFee.toFixed(2));
    }
  
    const distanceKm = await getDistanceKm();
    const distanceComponent = distanceKm * delivery_fee;
    const weightComponent = weightChargeKg * estimatedWeight;
    const total = distanceComponent + weightComponent;
  
    console.log('📦 Local Delivery Fee Breakdown:', {
      totalItems,
      weightChargeKg,
      distanceKm: distanceKm.toFixed(2),
      delivery_fee,
      estimatedWeight,
      distanceComponent: distanceComponent.toFixed(2),
      weightComponent: weightComponent.toFixed(2),
      deliveryFee: total.toFixed(2),
    });
  
    return parseFloat(total.toFixed(2));
  };
  
  
  const validateForm = (): boolean => {
    if (orderType === 'collection') return true;
    const requiredFields: (keyof FormFields)[] = [
      'first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'postal_code', 'country',
    ];
    for (const field of requiredFields) {
      if (!form[field] || form[field].trim() === '') {
        Alert.alert('Missing Field', `Please enter your ${field.replace('_', ' ')}.`);
        return false;
      }
    }
    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;
  
    const delivery = await calculateDeliveryFee(); // 👈 call async fee
    setCalculatedDeliveryFee(delivery); // 👈 store in state
  
    setConfirmVisible(true);
  };
  

  const confirmPayment = async () => {
    const auth = ensureAuth();
    if (!auth || !siteSettings) return;
    setConfirmVisible(false);
    setLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const vat = calculateVAT(subtotal);
      const delivery = await calculateDeliveryFee();
      const final = subtotal + vat + delivery - rewardApplied;

      const formData = new FormData();
      formData.append('user_id', String(auth.user.user_id));
      formData.append('total_price', String(final));
      formData.append('reward_applied', String(rewardApplied));
      formData.append('address', form.address);
      formData.append('city', form.city);
      formData.append('postal_code', form.postal_code);
      formData.append('country', form.country);
      formData.append('payment_method', 'payfast');
      formData.append('status', 'pending');
      formData.append('order_type', orderType);
      formData.append('vat_amount', String(vat));
      formData.append('delivery_fee', String(delivery));
      formData.append('items', JSON.stringify(cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        is_bulk: item.isBulk || false,
      }))));

      if (design.brandLogo) {
        const brandLogoFile: RNImageFile = {
          uri: design.brandLogo,
          name: 'brand_logo.png',
          type: 'image/png',
        };
        appendImageToFormData(formData, 'brand_logo', brandLogoFile);
        formData.append('brand_logo_qty', String(design.brandLogoQty || 1));
      }

      if (design.customDesign) {
        const customDesignFile: RNImageFile = {
          uri: design.customDesign,
          name: 'custom_design.png',
          type: 'image/png',
        };
        appendImageToFormData(formData, 'custom_design', customDesignFile);
        formData.append('custom_design_qty', String(design.customDesignQty || 1));
      }

      const res = await checkoutOrder(formData);
      setOrderId(res.order_id);
      setBulkOrderId(res.bulk_order_id);
      setPayFastVisible(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      Alert.alert('Error', error?.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = async (reference?: string) => {
    if (!reference || !user) return;
    const fullName = `${form.first_name} ${form.last_name}`.trim();
    try {
      if (orderId) {
        await fetch(`${API_BASE_URL}/order/orders/${orderId}/update-status/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Processing' }),
        });
      }
      if (bulkOrderId) {
        await fetch(`${API_BASE_URL}/order/bulk-orders/${bulkOrderId}/update-status/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Processing' }),
        });
      }
      await updateUserProfile(user.user_id, { name: fullName, ...form });
      dispatch(clearCart());
      dispatch(clearDesign());
      setPayFastVisible(false);
      setShowSuccess(true);
    } catch {
      Alert.alert('Error', 'Failed to finalize payment.');
    }
  };


  const autofillFromCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(location.coords);
      const first = geocode[0];
  
      if (first) {
        const country = first.country || '';
        const city = first.city || '';
        const postal_code = first.postalCode || '';
        const address = `${first.streetNumber || first.name || ''} ${first.street || ''}`.trim();
        const isoCode = first.isoCountryCode || '';
  
        let cleanedNumber = form.phone_number.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const dialCode = getCountryCallingCode(isoCode);
  
        // Prepend country code if not already there
        if (!form.phone_number.startsWith('+')) {
          cleanedNumber = `+${dialCode}${cleanedNumber}`;
        } else {
          cleanedNumber = form.phone_number; // don't overwrite if user already typed +...
        }
  
        setForm((prev) => ({
          ...prev,
          address,
          city,
          postal_code,
          country,
          phone_number: cleanedNumber,
        }));
      }
    } catch {
      Alert.alert('Error', 'Failed to get your location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const vat = calculateVAT(subtotal);
  const amount = subtotal + vat + calculatedDeliveryFee - rewardApplied;


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`p-4 pb-28`}>
        <Text style={tw`text-2xl font-bold text-center mb-4`}>Checkout 🛒</Text>
        <DeliverySelector selected={orderType} onChange={setOrderType} />
        {orderType === 'delivery' ? (
          <CheckoutForm
            form={form}
            setForm={(f) => setForm((p) => ({ ...p, ...f }))}
            editableFields={{
              first_name: true, last_name: true, email: true, phone_number: true,
              address: true, city: true, postal_code: true, country: true,
            }}
            onUseCurrentLocation={autofillFromCurrentLocation}
          />
        ) : (
          <View style={tw`bg-yellow-100 p-4 rounded-lg my-4`}>
            <Text style={tw`text-yellow-800 font-semibold`}>
              🏬 You&apos;ll collect this order from our store. No need to enter shipping info.
            </Text>
          </View>
        )}
       <CheckoutSummary
        cartItems={cartItems}
        rewardApplied={rewardApplied}
        rewardBalance={rewardBalance}
        siteSettings={siteSettings}
        orderType={orderType}
        deliveryFee={calculatedDeliveryFee}
        deliveryFeeLoading={deliveryFeeLoading}
        brandLogoQty={design.brandLogo ? design.brandLogoQty || 1 : 0}
        customDesignQty={design.customDesign ? design.customDesignQty || 1 : 0}
      />


        <TouchableOpacity onPress={initiatePayment} style={tw`bg-green-600 mt-6 p-4 rounded-lg`}>
          {loading || locationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white text-center font-bold text-lg`}>💳 Pay Now</Text>
          )}
        </TouchableOpacity>
        <InfoTooltip text="Rewards apply to orders of R1000+. Delivery fee is distance-based." />
      </ScrollView>

      {payFastVisible && (orderId || bulkOrderId) && (
        <PayFast
          merchantId="10037687"
          merchantKey="t9k4qun47sejo"
          sandbox
          notifyUrl="https://www.ghanadude.co.za/order/notify/"
          transactionDetails={{
            customerFirstName: form.first_name,
            customerLastName: form.last_name,
            customerEmailAddress: form.email,
            customerPhoneNumber: form.phone_number,
            reference: orderId ? `ORDER_${orderId}` : `BULKORDER_${bulkOrderId}`,
            amount: Number(amount.toFixed(2)),
            itemName: cartItems.map(item => `${item.quantity}x ${item.name.replace(/[^a-zA-Z0-9 ]/g, '')}`).join(' & ').slice(0, 100),
            itemDescription: 'Checkout Payment',
          }}
          isVisible={payFastVisible}
          onClose={handlePaymentClose}
        />
      )}

      <Modal visible={confirmVisible} animationType="slide" transparent>
        <View style={tw`flex-1 justify-center bg-black bg-opacity-30`}>
          <View style={tw`bg-white p-6 rounded-t-3xl`}>
            <Text style={tw`text-lg font-bold mb-2`}>Confirm Your Order</Text>
            <Text>Total: R{amount.toFixed(2)}</Text>
            <View style={tw`mt-4 flex-row justify-between`}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={tw`bg-gray-300 px-4 py-2 rounded-lg`}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPayment} style={tw`bg-green-600 px-4 py-2 rounded-lg`}>
                <Text style={tw`text-white`}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showSuccess && (
        <Animated.View
          style={[
            tw`absolute inset-0 bg-white items-center justify-center`,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={tw`text-5xl text-green-600 mb-4`}>✅</Text>
          <Text style={tw`text-lg font-bold`}>Payment Successful!</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

export default CheckoutScreen;
