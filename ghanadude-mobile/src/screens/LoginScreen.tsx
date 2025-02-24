import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc"; // Tailwind for React Native

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  //const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 px-5 justify-center`}>
      <View style={tw`w-full max-w-sm mx-auto bg-white p-6 rounded-xl shadow-lg`}>
        {/* Title */}
        <Text style={tw`text-3xl font-bold text-center text-gray-900 mb-6`}>
          Login
        </Text>

        {/* Email Input */}
        <View>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Email</Text>
          <TextInput
            style={tw`border border-gray-300 bg-white rounded-lg p-3 mt-1 text-gray-800`}
            placeholder="Enter your email"
            placeholderTextColor="#808080"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Input */}
        <View style={tw`mt-4`}>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Password</Text>
          <View style={tw`relative`}>
            <TextInput
              style={tw`border border-gray-300 bg-white rounded-lg p-3 pr-10 mt-1 text-gray-800`}
              placeholder="Enter your password"
              placeholderTextColor="#808080"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={tw`absolute right-3 top-4`}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color="#808080" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={tw`mt-2 self-end`}>
          <Text style={tw`text-sm text-blue-600`}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={tw`bg-blue-600 py-3 rounded-lg mt-5`} onPress={() => console.log("Login pressed")}>
          <Text style={tw`text-white text-center text-lg font-bold`}>Login</Text>
        </TouchableOpacity>

        {/* Or Divider */}
        <View style={tw`flex-row items-center my-5`}>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
          <Text style={tw`px-3 text-gray-600 text-sm`}>Or</Text>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
        </View>

        {/* Social Login */}
        <View style={tw`flex-row justify-center space-x-4`}>
          <TouchableOpacity style={tw`p-3 bg-white border border-gray-300 rounded-full shadow`}>
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={tw`p-3 bg-white border border-gray-300 rounded-full shadow`}>
            <FontAwesome name="facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* Signup Link */}
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-700 text-sm`}>Don't have an account?</Text>
          <TouchableOpacity>
            <Text style={tw`text-blue-600 text-sm font-bold`}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
