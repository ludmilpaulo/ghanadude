import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

const AccountScreen = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`bg-blue-500 py-8`}> 
        <Text style={tw`text-2xl font-bold text-white text-center`}>My Account</Text>
      </View>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 border-b border-gray-200 bg-white`}>
        <Text style={tw`text-base text-gray-700`}>Orders</Text>
        <Text style={tw`text-xl text-gray-400`}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 border-b border-gray-200 bg-white`}>
        <Text style={tw`text-base text-gray-700`}>Coupons & Rewards</Text>
        <Text style={tw`text-xl text-gray-400`}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 border-b border-gray-200 bg-white`}>
        <Text style={tw`text-base text-gray-700`}>Profile Information</Text>
        <Text style={tw`text-xl text-gray-400`}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 border-b border-gray-200 bg-white`}>
        <Text style={tw`text-base text-gray-700`}>Payment Methods</Text>
        <Text style={tw`text-xl text-gray-400`}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 border-b border-gray-200 bg-white`}>
        <Text style={tw`text-base text-gray-700`}>Settings</Text>
        <Text style={tw`text-xl text-gray-400`}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row justify-between items-center py-4 px-5 bg-white`} onPress={handleLogout}>
        <Text style={tw`text-base text-red-500`}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AccountScreen;
