import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser, selectToken } from '../redux/slices/authSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import {
  fetchRewards,
  fetchUserProfile,
  updateUserProfile,
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

  interface Rewards {
    reward_balance: string;
  }

  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    first_name: '',
    last_name: '',
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
      loadRewards();
    }
  }, []);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`bg-blue-700 py-10 px-5 rounded-b-3xl shadow-md`}>
        <Text style={tw`text-3xl font-bold text-white text-center`}>My Account</Text>
      </View>

      {/* Rewards Card */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl p-5`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>🎁 Rewards</Text>
        {rewards ? (
          <>
            <Text>
              Available Reward Balance:{' '}
              <Text style={tw`font-bold text-green-700`}>
                R{parseFloat(rewards.reward_balance).toFixed(2)}
              </Text>
            </Text>
            <Text style={tw`text-sm text-gray-500 mt-1`}>
              Your reward balance will be automatically applied at checkout.
            </Text>
          </>
        ) : (
          <ActivityIndicator size="small" color="#4A5568" />
        )}

        {/* View Orders CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderHistory')}
          style={tw`mt-4 bg-blue-700 py-3 rounded-xl`}
        >
          <Text style={tw`text-white text-center font-bold text-base`}>
            📦 View My Orders
          </Text>
        </TouchableOpacity>
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
