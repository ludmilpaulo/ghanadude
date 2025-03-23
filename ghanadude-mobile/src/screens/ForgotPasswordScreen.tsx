import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../utils/types"; // Adjust the import according to your project structure
import { LinearGradient } from "expo-linear-gradient";

import authService from "../services/AuthService";

import tw from "twrnc";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    setLoading(true);
    try {
        await authService.resetPassword(email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError("");
      setLoading(false);
      Alert.alert("Success", "Password reset email sent successfully.");
      navigation.navigate("Login");
    } catch {
      setError("Failed to send password reset email. Please try again.");
      setMessage("");
      setLoading(false);
      Alert.alert("Error", "Failed to send password reset email. Please try again.");
      navigation.navigate("Signup");
    }
  };

  return (
    <LinearGradient colors={["#1E90FF", "#800080"]} style={tw`flex-1 items-center justify-center`}>
    <View style={tw`flex-1 items-center justify-center`}>
      {loading && (
        <View style={tw`fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50`}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <View style={tw`bg-white p-8 rounded-xl shadow-lg w-full max-w-md`}>
        <Text style={tw`text-3xl font-bold mb-6 text-center text-gray-700`}>Forgot Password</Text>
        {message && <Text style={tw`text-green-500 text-center mb-4`}>{message}</Text>}
        {error && <Text style={tw`text-red-500 text-center mb-4`}>{error}</Text>}
        <View style={tw`mb-4`}>
          <Text style={tw`block text-sm font-semibold mb-2 text-gray-700`}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={tw`w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
        </View>
        <Button title="Send Password Reset Email" onPress={handleSubmit} color="#1E90FF" />
      </View>
    </View>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen;