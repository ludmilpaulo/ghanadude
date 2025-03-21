import React, { useState, useEffect } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentScreen = ({ route, navigation }) => {
  const { orderId } = route.params; // Get the order ID passed from the previous screen
  const [loading, setLoading] = useState(true);

  const handlePaymentSuccess = () => {
    Alert.alert('Payment Success', 'Your payment has been successfully processed!');
    navigation.goBack(); // Go back after successful payment
  };

  const handlePaymentFailure = () => {
    Alert.alert('Payment Failed', 'There was an issue with your payment. Please try again.');
    navigation.goBack(); // Go back after failure
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <WebView
        source={{
          uri: `https://yourbackend.com/payfast/payment-form/${orderId}`, // Endpoint to fetch the PayFast form
        }}
        onLoadEnd={() => setLoading(false)}
        onMessage={(event) => {
          // Here you can listen for messages from the WebView (e.g., payment success or failure)
          const message = event.nativeEvent.data;
          if (message === 'payment_success') {
            handlePaymentSuccess();
          } else if (message === 'payment_failure') {
            handlePaymentFailure();
          }
        }}
      />
    </View>
  );
};

export default PaymentScreen;
