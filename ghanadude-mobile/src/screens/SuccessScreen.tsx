import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import tw from "twrnc";
import { StackNavigationProp } from "@react-navigation/stack";

type SuccessScreenRouteProp = RouteProp<HomeStackParamList, "SuccessScreen">;
type NavigationProp = StackNavigationProp<HomeStackParamList, "SuccessScreen">;

const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const { order_id, bulk_order_id } = route.params || {};

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, []);

  const handleContinue = () => {
    setLoading(true);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],
      });
    }, 500);
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
      <Animated.View
        style={[
          tw`bg-green-100 p-6 rounded-full mb-6`,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={tw`text-5xl text-green-600`}>✓</Text>
      </Animated.View>

      <Animated.Text
        style={[
          tw`text-3xl font-bold text-gray-800 mb-2`,
          { opacity: scaleAnim },
        ]}
      >
        Thank You!
      </Animated.Text>

      {order_id && bulk_order_id ? (
        <>
          <Text style={tw`text-center text-lg text-gray-600 mb-1`}>
            Your regular order #{order_id} has been placed.
          </Text>
          <Text style={tw`text-center text-lg text-gray-600 mb-4`}>
            Your bulk order #{bulk_order_id} has been placed.
          </Text>
        </>
      ) : order_id ? (
        <Text style={tw`text-center text-lg text-gray-600 mb-4`}>
          Your order #{order_id} has been successfully placed.
        </Text>
      ) : bulk_order_id ? (
        <Text style={tw`text-center text-lg text-gray-600 mb-4`}>
          Your bulk order #{bulk_order_id} has been successfully placed.
        </Text>
      ) : (
        <Text style={tw`text-center text-lg text-gray-600 mb-4`}>
          Your order has been placed.
        </Text>
      )}

      <TouchableOpacity
        style={tw`bg-blue-600 w-full py-3 rounded-full mt-4 ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <View style={tw`flex-row justify-center items-center`}>
            <ActivityIndicator color="#fff" />
            <Text style={tw`text-white font-semibold ml-2`}>Loading...</Text>
          </View>
        ) : (
          <Text style={tw`text-white font-semibold text-center`}>
            Continue Shopping
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;
