import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import tw from "twrnc"; // Tailwind for React Native

const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmailValid = email.includes("@") && email.includes(".");

  // Function to handle sign up
  const handleSignUp = async () => {
    // Validate inputs
    console.log(email);
    console.log(username);
    console.log(password);
    /* if (!email || !password || !name) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isEmailValid) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors before making the request */

    try {
      const response = await fetch(
        `https://www.ghanadude.co.za/account/signup/`, // Correct sign-up endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            username: username,
          }),
        }
      );
      // If the response is successful
      if (response.ok) {
        const data = await response.json();
        console.log("Sign-up successful", data);
        setEmail("");
        setPassword("");
        setUserName("");
        setError("");
        setLoading(false);
        // Navigate to the login page after successful sign-up
        navigation.navigate("Login");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Sign-up failed");
        console.log("Sign-up failed", errorData);
        setLoading(false);
      }
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) {
        setError("Network error: " + error.message);
        console.log("Error", error);
      } else {
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

        {isEmailValid && (
          <>
            {/* Name Input */}
            <View style={tw`mt-4`}>
              <Text style={tw`text-lg font-semibold text-gray-700`}>
                Username
              </Text>
              <TextInput
                style={tw`border border-gray-300 bg-white rounded-lg p-3 mt-1 text-gray-800`}
                placeholder="Enter your name"
                autoCapitalize="none"
                value={username}
                onChangeText={setUserName}
              />
            </View>

            {/* Password Input */}
            <View style={tw`mt-4`}>
              <Text style={tw`text-lg font-semibold text-gray-700`}>
                Password
              </Text>
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
        {error ? (
          <Text style={tw`text-red-600 text-center mt-4`}>{error}</Text>
        ) : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={tw`bg-orange-600 py-3 rounded-lg mt-5`}
          onPress={handleSignUp} // Trigger the sign-up function here
        >
          <Text style={tw`text-white text-center text-lg font-bold`}>
            Get Started
          </Text>
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
          <Text style={tw`text-gray-700 text-sm`}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={tw`text-blue-600 text-sm font-bold`}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
