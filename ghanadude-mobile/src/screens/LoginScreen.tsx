import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import tw from "twrnc";
import authService from "../services/AuthService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UserLogin"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(usernameOrEmail, password);
      dispatch(loginUser(response));
      Alert.alert("Success", "Login successful!");
      console.log("Login successful", response);
    } catch (error: unknown) {
      const err = error as Error;
      Alert.alert("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 px-6 justify-center`}>
      {/* Logo */}
      <View style={tw`items-center mb-8`}>
        <Image
          source={require("../../assets/logo.png")} // Ensure correct logo path
          style={tw`w-28 h-28 mb-5`}
          resizeMode="contain"
        />
      </View>

      {/* Login Form */}
      <View style={tw`w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl`}>
        {/* Username/Email Input */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Username or Email</Text>
          <TextInput
            style={tw`border border-gray-300 bg-gray-50 rounded-2xl p-3 mt-2 text-gray-800 shadow-sm`}
            placeholder="Enter username or email"
            placeholderTextColor="#808080"
            autoCapitalize="none"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
          />
        </View>

        {/* Password Input */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Password</Text>
          <View style={tw`relative`}>
            <TextInput
              style={tw`border border-gray-300 bg-gray-50 rounded-2xl p-3 pr-12 mt-2 text-gray-800 shadow-sm`}
              placeholder="Enter your password"
              placeholderTextColor="#808080"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={tw`absolute right-4 top-4`}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="#808080"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={tw`mt-2 self-end`}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={tw`text-sm text-blue-600 font-semibold`}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={tw`bg-blue-600 py-4 rounded-2xl mt-6 shadow-lg`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-bold`}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={tw`my-5 flex-row items-center`}>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
          <Text style={tw`px-3 text-gray-500 font-semibold`}>OR</Text>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
        </View>

        {/* Social Login Buttons */}
        <View>
          <TouchableOpacity style={tw`flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-2xl mb-3 shadow-sm`}>
            <FontAwesome name="google" size={22} color="#db4a39" />
            <Text style={tw`text-gray-700 text-lg font-semibold ml-3`}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-2xl shadow-sm`}>
            <FontAwesome name="facebook" size={22} color="#1877f2" />
            <Text style={tw`text-gray-700 text-lg font-semibold ml-3`}>
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Signup Navigation */}
        <View style={tw`mt-6 flex-row justify-center`}>
          <Text style={tw`text-gray-600 text-base`}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text style={tw`text-blue-600 text-base font-semibold`}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
