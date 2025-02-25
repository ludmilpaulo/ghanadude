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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import tw from "twrnc"; // Tailwind for React Native

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // To handle error messages
  const [loading, setLoading] = useState(false); // To handle loading state

  // Function to handle login
  const handleLogin = async () => {
    // Check if email and password are provided
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true); // Start loading when request is made

    try {
      // Construct the POST request with the email and password in the body
      const response = await fetch(
        `https://www.ghanadude.co.za/account/login/`, // Correct login endpoint
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      // If response is successful, process the data
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful", data);
        // Clear form fields after successful login
        setEmail("");
        setPassword("");
        setError(""); // Clear any previous error message
        setLoading(false); // Stop loading
        // Navigate to next screen after successful login
        // navigation.navigate("Home");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
        console.log("Login failed", errorData);
        setLoading(false); // Stop loading
      }
    } catch (error: unknown) {
      setLoading(false); // Stop loading if there's a network error
      if (error instanceof Error) {
        // If error is an instance of Error, handle it
        setError("Network error: " + error.message);
        console.log("Error", error);
      } else {
        // If error is not an instance of Error, handle it
        setError("Unknown error occurred");
        console.log("Unknown error", error);
      }
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 px-5 justify-center`}>
      <View
        style={tw`w-full max-w-sm mx-auto bg-white p-6 rounded-xl shadow-lg`}
      >
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
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={18}
                color="#808080"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={tw`mt-2 self-end`}>
          <Text style={tw`text-sm text-blue-600`}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={tw`bg-blue-600 py-3 rounded-lg mt-5`}
          onPress={handleLogin} // Calls handleLogin on press
          disabled={loading} // Disable button when loading
        >
          <Text style={tw`text-white text-center text-lg font-bold`}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <Text style={tw`text-red-600 text-center mt-4`}>{error}</Text>
        ) : null}

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

        {/* Signup Link */}
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-700 text-sm`}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={tw`text-blue-600 text-sm font-bold`}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
