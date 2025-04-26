import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
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
        }),
      );
      navigation.navigate("HomeScreen");

      Alert.alert("Success", "Your account has been created!");
      setEmail("");
      setPassword("");
      setUserName("");
    } catch (err: unknown) {
      console.log("Signup error:", err);

      if (typeof err === "string") {
        setError(err);
      } else if (
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        typeof (err as { error: unknown }).error === "string"
      ) {
        setError((err as { error: string }).error);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#fcd116", "#000000", "#ce1126"]}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={tw`flex-1`}
        >
          <ScrollView
            contentContainerStyle={tw`flex-grow items-center justify-center px-6 py-10`}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={tw`w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl`}
            >
              {/* Header */}
              <Text
                style={tw`text-3xl font-bold text-center text-gray-900 mb-1`}
              >
                Create Account
              </Text>
              <Text style={tw`text-base text-gray-600 text-center mb-6`}>
                Discover your perfect style
              </Text>

              {/* Email Input */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                  Email
                </Text>
                <TextInput
                  style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800`}
                  placeholder="you@example.com"
                  placeholderTextColor="#808080"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Username Input */}
              {isEmailValid && (
                <View style={tw`mb-5`}>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                    Username
                  </Text>
                  <TextInput
                    style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800`}
                    placeholder="Your name or brand"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUserName}
                  />
                </View>
              )}

              {/* Password Input */}
              {isEmailValid && (
                <View style={tw`mb-5`}>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                    Password
                  </Text>
                  <View style={tw`relative`}>
                    <TextInput
                      style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 pr-12 text-base text-gray-800`}
                      placeholder="Create a secure password"
                      placeholderTextColor="#808080"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      style={tw`absolute right-4 top-3.5`}
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
              )}

              {/* Error Message */}
              {error ? (
                <Text style={tw`text-red-600 text-center mt-1 mb-2`}>
                  {error}
                </Text>
              ) : null}

              {/* Sign Up Button */}
              <TouchableOpacity
                style={tw`bg-blue-700 py-4 rounded-xl mt-2 shadow-lg flex-row justify-center items-center`}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={tw`text-white text-base font-bold`}>
                    Get Started
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={tw`my-6 flex-row items-center`}>
                <View style={tw`flex-1 h-px bg-gray-300`} />
                <Text style={tw`px-3 text-gray-500 font-medium`}>OR</Text>
                <View style={tw`flex-1 h-px bg-gray-300`} />
              </View>

              {/* Login Navigation */}
              <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-gray-600 text-base`}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("UserLogin")}
                >
                  <Text style={tw`text-blue-700 text-base font-semibold`}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
