import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { handleMakePayment } from "../services/PayFastService";

const CheckoutScreen = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  const navigation = useNavigation();
  const webviewRef = useRef<WebView>(null);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
  });

  const [payfastURL, setPayfastURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    console.log("Shipping Info:", shippingInfo);

    if (!shippingInfo.fullName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim() || !shippingInfo.city.trim() || !shippingInfo.postalCode.trim() || !shippingInfo.email.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    Alert.alert("Processing Payment", "Redirecting to PayFast...");

    try {
      const paymentURL = await handleMakePayment(shippingInfo, totalPrice);
      if (paymentURL) {
        setPayfastURL(paymentURL);
      } else {
        Alert.alert("Payment Error", "Could not generate a PayFast payment URL.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      Alert.alert("Error", "Something went wrong while processing the payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      {payfastURL ? (
        <WebView
          ref={webviewRef}
          source={{ uri: payfastURL }}
          style={{ flex: 1 }}
          onNavigationStateChange={(navState) => {
            if (navState.url === "https://www.trustmenclinic.com/thank-you") {
              Alert.alert("Payment Successful", "Your payment has been processed successfully.");
              navigation.navigate("SuccessScreen");
            } else if (navState.url === "https://www.trustmenclinic.com/cancel") {
              Alert.alert("Payment Cancelled", "Your payment was cancelled.");
              setPayfastURL(null);
            }
          }}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={tw`text-2xl font-bold mb-4 text-black text-center`}>Checkout</Text>

          {/* Payment Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#34D399" />
          ) : (
            <TouchableOpacity style={tw`bg-green-600 p-4 rounded-lg`} onPress={handlePlaceOrder}>
              <Text style={tw`text-white text-lg font-semibold text-center`}>Proceed to Payment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CheckoutScreen;
