import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import tw from "twrnc";
import { RootStackParamList } from "../navigation/types";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import AuthService from "../services/AuthService";

export default function SignUpScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmailValid = email.includes("@") && email.includes(".");

  // Function to handle sign up
  const handleSignUp = async () => {
    if (!email || !password || !username) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isEmailValid) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await AuthService.signup(username, email, password);

      dispatch(
        loginUser({
          user: {
            user_id: response.user_id,
            username: response.username,
            is_staff: response.is_staff,
            is_superuser: response.is_superuser,
          },
          token: response.token,
        })
      );
      setLoading(false);

      // Show success alert
      Alert.alert("Success", "Your account has been created!", [
        { text: "OK" }
      ]);

      // Clear input fields
      setEmail("");
      setPassword("");
      setUserName("");
    } catch (error) {
      setLoading(false);
      setError(typeof error === "string" ? error : "Sign-up failed");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 px-5 justify-center`}>
      <View style={tw`w-full max-w-sm mx-auto bg-white p-6 rounded-xl shadow-lg`}>
        {/* Title */}
        <Text style={tw`text-3xl font-bold text-center text-gray-900 mb-6`}>
          Sign Up
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

        {/* Other Inputs */}
        {isEmailValid && (
          <>
            {/* Username */}
            <View style={tw`mt-4`}>
              <Text style={tw`text-lg font-semibold text-gray-700`}>Username</Text>
              <TextInput
                style={tw`border border-gray-300 bg-white rounded-lg p-3 mt-1 text-gray-800`}
                placeholder="Enter your name"
                autoCapitalize="none"
                value={username}
                onChangeText={setUserName}
              />
            </View>

            {/* Password */}
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
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#808080"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Error Message */}
        {error ? <Text style={tw`text-red-600 text-center mt-4`}>{error}</Text> : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={tw`bg-blue-600 py-3 rounded-lg mt-5 flex-row justify-center items-center`}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={tw`text-white text-lg font-bold`}>Get Started</Text>
          )}
        </TouchableOpacity>

        {/* Or Divider */}
        <View style={tw`flex-row items-center my-5`}>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
          <Text style={tw`px-3 text-gray-600 text-sm`}>Or</Text>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
        </View>

        {/* Social Login */}
        <View style={tw`flex-row justify-center space-x-4`}>
          <TouchableOpacity
            style={tw`p-3 bg-white border border-gray-300 rounded-full shadow w-12 h-12 justify-center items-center`}
          >
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`p-3 bg-white border border-gray-300 rounded-full shadow w-12 h-12 justify-center items-center`}
          >
            <FontAwesome name="facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-700 text-sm`}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserLogin")}>
            <Text style={tw`text-blue-600 text-sm font-bold`}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
