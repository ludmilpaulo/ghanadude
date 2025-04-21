import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import authService from "../services/AuthService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { FontAwesome } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(email);
      setUsername(response.username);
      setUid(response.uid);
      setToken(response.token);
      setStep("reset");
      Alert.alert("Verified", "Email found. You can now set a new password.");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        typeof (err as { error: unknown }).error === "string"
          ? (err as { error: string }).error
          : "Something went wrong.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) {
      Alert.alert("Validation Error", "Please enter a new password.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPasswordConfirm(uid, token, newPassword);
      Alert.alert("Success", "Your password has been reset.");
      navigation.navigate("UserLogin");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        typeof (err as { error: unknown }).error === "string"
          ? (err as { error: string }).error
          : "Something went wrong.";
      Alert.alert("Reset Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#fcd116", "#000000", "#ce1126"]}
      style={tw`flex-1`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={tw`flex-1`}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center items-center px-6 py-10`}
          keyboardShouldPersistTaps="handled"
        >
          <View style={tw`w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl`}>
            <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
              {step === "request" ? "Forgot Password" : "Reset Password"}
            </Text>

            {step === "request" && (
              <>
                <TextInput
                  style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 shadow-sm mb-5`}
                  placeholder="Enter your email"
                  placeholderTextColor="#808080"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <TouchableOpacity
                  style={tw`bg-blue-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center`}
                  onPress={handleEmailSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tw`text-white text-base font-bold`}>
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === "reset" && (
              <>
                <Text style={tw`text-center text-gray-600 mb-4`}>
                  Hello <Text style={tw`font-bold`}>{username}</Text>, please
                  enter your new password.
                </Text>

                <View style={tw`relative`}>
                  <TextInput
                    style={tw`border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 pr-12 text-base text-gray-800 shadow-sm mb-5`}
                    placeholder="New password"
                    placeholderTextColor="#808080"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    style={tw`absolute right-4 top-4`}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye" : "eye-slash"}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={tw`bg-green-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center`}
                  onPress={handlePasswordReset}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tw`text-white text-base font-bold`}>
                      Reset Password
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
