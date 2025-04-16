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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import tw from "twrnc";
import authService from "../services/AuthService";
import logo from "../../assets/logo.png";
import { LinearGradient } from "expo-linear-gradient";
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
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await authService.login(usernameOrEmail, password);
  
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
  
      Alert.alert("Welcome", "Login successful!");
    } catch (err: unknown) {
      console.log("Login error:", err);
  
      if (
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        typeof (err as { error: unknown }).error === "string"
      ) {
        const message = (err as { error: string }).error;
        Alert.alert("Login Failed", message);
      } else if (typeof err === "string") {
        Alert.alert("Login Failed", err);
      } else {
        Alert.alert("Login Failed", "Something went wrong.");
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
            {/* White Card */}
            <View style={tw`w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl`}>
              {/* Logo */}
              <View style={tw`items-center mb-6`}>
                <Image
                  source={logo}
                  style={tw`w-46 h-46`}
                  resizeMode="contain"
                />
                
              </View>

              {/* Username/Email */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                  Username or Email
                </Text>
                <TextInput
                  style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm`}
                  placeholder="Enter your email or username"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                />
              </View>

              {/* Password */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                  Password
                </Text>
                <View style={tw`relative`}>
                  <TextInput
                    style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 pr-12 text-base text-gray-800 shadow-sm`}
                    placeholder="Enter your password"
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

              {/* Forgot Password */}
              <TouchableOpacity
                style={tw`mt-1 mb-3 self-end`}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={tw`text-sm text-blue-600 font-semibold`}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={tw`bg-blue-700 py-4 rounded-xl mt-1 shadow-lg flex-row justify-center items-center`}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white text-base font-bold`}>
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={tw`my-6 flex-row items-center`}>
                <View style={tw`flex-1 h-px bg-gray-300`} />
                <Text style={tw`px-3 text-gray-400 font-medium`}>OR</Text>
                <View style={tw`flex-1 h-px bg-gray-300`} />
              </View>

              {/* Signup Navigation */}
              <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-gray-600 text-base`}>
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SignupScreen")}
                >
                  <Text style={tw`text-blue-700 text-base font-semibold`}>
                    Sign Up
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
