import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, Modal, TextInput, Image,
} from 'react-native';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser, selectToken } from '../redux/slices/authSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import {
  fetchUserOrders,
  Order,
} from '../services/OrderService';
import {
  fetchRewards,
  fetchUserProfile,
  updateUserProfile,
  redeemRewards,
  ProfileForm,
} from '../services/UserService';
import { fetchAndPrefillLocation } from '../services/LocationService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigation/HomeNavigator';


type NavigationProp = StackNavigationProp<HomeStackParamList>;

const AccountScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [statusFilter, setStatusFilter] = useState<string>('Completed');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [rewards, setRewards] = useState<{
    total_points: number;
    redeemable: boolean;
    coupon_code?: string;
  } | null>(null);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
  });

  const ensureAuth = () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in.');
      return null;
    }
    return { user, token };
  };

  useEffect(() => {
    const auth = ensureAuth();
    if (auth) {
      loadOrders(statusFilter);
      loadRewards();
    }
  }, [statusFilter]);

  const loadOrders = async (status: string) => {
    const auth = ensureAuth();
    if (!auth) return;

    setLoadingOrders(true);
    try {
      const res = await fetchUserOrders(auth.user.user_id, auth.token, status);
      setOrders(res);
    } catch {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadRewards = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      const res = await fetchRewards(auth.user.user_id);
      setRewards(res);
    } catch {
      Alert.alert('Error', 'Failed to load rewards');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  const handleRedeem = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      const res = await redeemRewards(auth.user.user_id);
      Alert.alert('Success 🎉', `Coupon generated: ${res.coupon_code}`);
      setRewards((prev) => ({
        ...prev!,
        redeemable: false,
        coupon_code: res.coupon_code,
        total_points: 0,
      }));
    } catch {
      Alert.alert('Error', 'Failed to redeem rewards');
    }
  };

  const loadProfileData = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      const res = await fetchUserProfile(auth.user.user_id);
      setProfileForm(res);

      const location = await fetchAndPrefillLocation();
      if (location) {
        setProfileForm(prev => ({
          ...prev,
          ...location,
        }));
      }

      setProfileModalVisible(true);
    } catch {
      Alert.alert('Error', 'Could not load profile');
    }
  };

  const handleProfileUpdate = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      await updateUserProfile(auth.user.user_id, profileForm);
      Alert.alert('Success', 'Profile updated');
      setProfileModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const groupOrdersByMonth = (ordersList: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    for (const order of ordersList) {
      const month = new Date(order.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(order);
    }
    return grouped;
  };

  const groupedOrders = groupOrdersByMonth(orders);

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`bg-blue-600 py-10 px-5 rounded-b-3xl shadow-md`}>
        <Text style={tw`text-3xl font-bold text-white text-center`}>My Account</Text>
      </View>

      {/* Rewards */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl p-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>🎁 Rewards</Text>
        {rewards ? (
          <>
            <Text>Total Points: <Text style={tw`font-bold`}>{rewards.total_points}</Text></Text>
            <Text>Redeemable: {rewards.redeemable ? '✅ Yes' : '❌ Not yet (min: 5 points)'}</Text>
            {rewards.coupon_code && (
              <Text style={tw`text-green-600 font-semibold`}>🎟️ Coupon: {rewards.coupon_code}</Text>
            )}
            {rewards.redeemable && (
              <TouchableOpacity onPress={handleRedeem} style={tw`mt-3 bg-green-600 py-2 px-4 rounded-lg`}>
                <Text style={tw`text-white text-center font-bold`}>Redeem Now</Text>
              </TouchableOpacity>
            )}
          </>
        ) : <ActivityIndicator size="small" color="#4A5568" />}
      </View>

      {/* Orders */}
      <View style={tw`mt-6 mx-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>📦 Your Orders</Text>
        <View style={tw`flex-row mb-3 flex-wrap`}>
          {['Pending', 'Processing', 'Completed', 'Cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={tw`px-3 py-2 rounded-full mr-2 mb-2 ${statusFilter === status ? 'bg-blue-600' : 'bg-gray-300'}`}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={tw`${statusFilter === status ? 'text-white' : 'text-black'}`}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingOrders ? (
          <ActivityIndicator size="large" color="#4A5568" />
        ) : (
          Object.entries(groupedOrders).map(([month, monthOrders]) => (
            <View key={month} style={tw`mb-6`}>
              <Text style={tw`text-base font-bold mb-2`}>{month}</Text>
              {monthOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => navigation.navigate('OrderDetail', { order })}
                  style={tw`bg-white p-4 rounded-lg shadow-md mb-3`}
                >
                  <Text style={tw`font-bold text-gray-800`}>Order #{order.id}</Text>
                  <Text>Status: {order.status}</Text>
                  <Text>Total: R{order.total_price}</Text>
                  <Text>{new Date(order.created_at).toLocaleDateString()}</Text>
                  {order.items?.[0]?.product?.images?.[0]?.image && (
                    <Image
                      source={{ uri: order.items[0].product.images[0].image }}
                      style={tw`w-full h-32 mt-2 rounded`}
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
          onPress={loadProfileData}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="user" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Profile Information</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={tw`mt-6 mx-4 mb-10`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-red-500 py-4 rounded-xl shadow-md`}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="white" />
          <Text style={tw`text-lg font-semibold text-white ml-3`}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <View style={tw`flex-1 bg-white p-6 justify-center`}>
          <Text style={tw`text-2xl font-bold mb-4`}>Edit Profile</Text>
          {Object.entries(profileForm).map(([field, value]) => (
            <TextInput
              key={field}
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder={field.replace('_', ' ').toUpperCase()}
              value={value}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, [field]: text }))
              }
            />
          ))}
          <TouchableOpacity
            style={tw`bg-blue-600 py-3 rounded-lg mb-2`}
            onPress={handleProfileUpdate}
          >
            <Text style={tw`text-white text-center font-bold`}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setProfileModalVisible(false)}
            style={tw`py-2`}
          >
            <Text style={tw`text-center text-blue-600`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AccountScreen;
