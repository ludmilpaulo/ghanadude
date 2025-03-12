import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { RootState } from "../redux/store";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

const CheckoutScreen = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.price) || 0) * item.quantity,
    0
  );

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handlePlaceOrder = () => {
    if (
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.postalCode
    ) {
      Alert.alert("Missing Information", "Please fill in all shipping details.");
      return;
    }

    Alert.alert(
      "Order Confirmed",
      "Your order has been placed successfully!",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={tw`text-2xl font-bold mb-4 text-black`}>Checkout</Text>

        {/* Order Summary */}
        <View style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-xl font-semibold mb-2`}>Order Summary</Text>
          {cartItems.length === 0 ? (
            <Text style={tw`text-gray-500 text-center`}>No items in cart</Text>
          ) : (
            cartItems.map((item, index) => (
              <View key={index} style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-gray-800`}>
                  {item.name} (x{item.quantity})
                </Text>
                <Text style={tw`text-gray-800 font-semibold`}>
                  R{(Number(item.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          )}
          {/* Total Price */}
          <View style={tw`border-t border-gray-300 mt-3 pt-2 flex-row justify-between`}>
            <Text style={tw`text-lg font-bold text-gray-900`}>Total</Text>
            <Text style={tw`text-lg font-bold text-black`}>R{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-xl font-semibold mb-2`}>Shipping Information</Text>

          <TextInput
            placeholder="Full Name"
            style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
            value={shippingInfo.fullName}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
          />
          <TextInput
            placeholder="Phone Number"
            keyboardType="phone-pad"
            style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
          />
          <TextInput
            placeholder="Street Address"
            style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
          />
          <TextInput
            placeholder="City"
            style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
            value={shippingInfo.city}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
          />
          <TextInput
            placeholder="Postal Code"
            keyboardType="numeric"
            style={tw`bg-white p-3 rounded-lg mb-3 text-black`}
            value={shippingInfo.postalCode}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, postalCode: text })}
          />
        </View>

        {/* Payment Section */}
        <View style={tw`bg-gray-100 p-4 rounded-lg mb-6`}>
          <Text style={tw`text-xl font-semibold mb-3`}>Payment Method</Text>
          <TouchableOpacity style={tw`bg-white p-4 rounded-lg flex-row items-center justify-between`}>
            <FontAwesome name="credit-card" size={20} color="black" />
            <Text style={tw`text-black ml-3`}>Credit / Debit Card</Text>
            <FontAwesome5 name="chevron-right" size={16} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={tw`bg-green-600 p-4 rounded-lg flex-row items-center justify-center shadow-md`}
          onPress={handlePlaceOrder}
        >
          <FontAwesome name="check-circle" size={20} color="white" />
          <Text style={tw`text-white text-lg font-semibold ml-2`}>Place Order</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
