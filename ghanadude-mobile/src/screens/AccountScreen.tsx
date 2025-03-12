import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import tw from "twrnc";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const AccountScreen = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => dispatch(logoutUser()) },
    ]);
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      {/* Header Section */}
      <View style={tw`bg-blue-600 py-10 px-5 rounded-b-3xl shadow-md`}>
        <Text style={tw`text-3xl font-bold text-white text-center`}>
          My Account
        </Text>
      </View>

      {/* Account Options */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="box" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Orders</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="gift" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Coupons & Rewards</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="user" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Profile Information</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="credit-card" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Payment Methods</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5`}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="cog" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>Settings</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#4A5568" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={tw`mt-6 mx-4`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-red-500 py-4 rounded-xl shadow-md`}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="white" />
          <Text style={tw`text-lg font-semibold text-white ml-3`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AccountScreen;
