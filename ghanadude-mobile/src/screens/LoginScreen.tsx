import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import tw from "twrnc";
import authService from "../services/AuthService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Import the type definition

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UserLogin"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      dispatch(loginUser(response));
      Alert.alert("Success", "Login successful!");
      console.log("Login successful", response);
    } catch (error: unknown) {
      const err = error as Error; // Ensure error type is properly handled
      Alert.alert("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-200 px-5 justify-center`}>
      <View
        style={tw`w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg`}
      >
        <Text style={tw`text-4xl font-bold text-center text-gray-900 mb-6`}>
          Welcome
        </Text>
        <Text style={tw`text-lg text-center text-gray-500 mb-6`}>
          Sign in to continue
        </Text>

        <View style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Email</Text>
          <TextInput
            style={tw`border border-gray-300 bg-white rounded-xl p-3 mt-2 text-gray-800`}
            placeholder="Enter your email"
            placeholderTextColor="#808080"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-700`}>Password</Text>
          <View style={tw`relative`}>
            <TextInput
              style={tw`border border-gray-300 bg-white rounded-xl p-3 pr-10 mt-2 text-gray-800`}
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
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="#808080"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Navigation */}
        <TouchableOpacity
          style={tw`mt-2 self-end`}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={tw`text-sm text-blue-600`}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-blue-600 py-4 rounded-xl mt-6`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-bold`}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Navigate to SignupScreen */}
        <View style={tw`mt-4 flex-row justify-center`}>
          <Text style={tw`text-gray-600 text-base`}>
            Don't have an account?{" "}
          </Text>
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
