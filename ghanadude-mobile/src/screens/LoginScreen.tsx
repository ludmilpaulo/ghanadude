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
import tw from "twrnc";
import authService from "../services/AuthService";

export default function LoginScreen() {
  const navigation = useNavigation();
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
      Alert.alert("Success", "Login successful!");
      // Navigate to home or dashboard after successful login
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-200 px-5 justify-center`}> 
      <View style={tw`w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg`}> 
        <Text style={tw`text-4xl font-bold text-center text-gray-900 mb-6`}>Welcome</Text>
        <Text style={tw`text-lg text-center text-gray-500 mb-6`}>Sign in to continue</Text>
        
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
            <TouchableOpacity style={tw`absolute right-3 top-4`} onPress={() => setShowPassword(!showPassword)}> 
              <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#808080" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={tw`mt-2 self-end`}>
          <Text style={tw`text-sm text-blue-600`}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`bg-blue-600 py-4 rounded-xl mt-6`} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-bold`}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={tw`flex-row items-center my-6`}> 
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
          <Text style={tw`px-3 text-gray-600 text-sm`}>Or continue with</Text>
          <View style={tw`flex-1 h-0.5 bg-gray-300`} />
        </View>

        <View style={tw`flex-row justify-center space-x-4`}> 
          <TouchableOpacity style={tw`p-3 bg-white border border-gray-300 rounded-full shadow`}> 
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={tw`p-3 bg-white border border-gray-300 rounded-full shadow`}> 
            <FontAwesome name="facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

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
