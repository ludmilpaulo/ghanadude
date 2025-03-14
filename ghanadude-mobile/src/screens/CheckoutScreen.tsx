import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { RootState } from "../redux/store";
import { FontAwesome, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// ✅ Define a Type for Shipping Info
interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const CheckoutScreen = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  const navigation = useNavigation();

  // ✅ Explicitly define `shippingInfo` type
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handlePlaceOrder = () => {
    if (Object.values(shippingInfo).some((val) => val.trim() === "")) {
      Alert.alert("Missing Information", "Please fill in all shipping details.");
      return;
    }
    Alert.alert("Order Confirmed", "Your order has been placed successfully!", [{ text: "OK" }]);
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <TouchableOpacity
        style={tw`absolute top-10 left-5 z-10 bg-white p-3 rounded-full shadow-md`}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={tw`text-2xl font-bold mb-4 text-black text-center`}>Checkout</Text>

        <View style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-xl font-semibold mb-2`}>Order Summary</Text>
          {cartItems.map((item, index) => (
            <View key={index} style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-gray-800`}>
                {item.name} (x{item.quantity})
              </Text>
              <Text style={tw`text-gray-800 font-semibold`}>
                R{(Number(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={tw`border-t border-gray-300 mt-3 pt-2 flex-row justify-between`}>
            <Text style={tw`text-lg font-bold text-gray-900`}>Total</Text>
            <Text style={tw`text-lg font-bold text-black`}>R{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-xl font-semibold mb-2`}>Shipping Information</Text>
          {Object.keys(shippingInfo).map((key) => (
            <TextInput
              key={key}
              placeholder={key.replace(/([A-Z])/g, " $1")}
              style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
              value={shippingInfo[key as keyof ShippingInfo]} // ✅ Explicitly type key
              onChangeText={(text) => setShippingInfo((prev) => ({
                ...prev,
                [key]: text
              }))}
            />
          ))}
        </View>

        <TouchableOpacity style={tw`bg-green-600 p-4 rounded-lg`} onPress={handlePlaceOrder}>
          <Text style={tw`text-white text-lg font-semibold text-center`}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
