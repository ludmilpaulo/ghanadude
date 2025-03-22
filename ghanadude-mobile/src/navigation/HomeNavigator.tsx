import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import MainTabNavigator from "./MainTabNavigator";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import SuccessScreen from "../screens/SuccessScreen";
import PaymentCancelled from "../screens/PaymentCancelled";
import MyCouponsScreen from "../screens/MyCouponsScreen";
import OrderHistory from "../screens/OrderHistory";
import InvoiceHistoryScreen from "../screens/InvoiceHistoryScreen";
import FullReviewScreen from "../screens/FullReviewScreen";

// ✅ Exporting HomeStackParamList so other files can import it
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductScreen: undefined;
  Home: undefined;
  ProductList: undefined;
  Cart: undefined;
  CheckoutScreen: undefined;
  SuccessScreen: { order_id: number };
  PaymentCancelled: undefined;
  ProductDetail: { id: number };
  MyCouponsScreen: undefined;
  OrderHistory: undefined;
  InvoiceHistoryScreen: undefined;
  FullReview: { id: number }; // ✅ ADD THIS


};


const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  const user = useSelector(selectUser);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="PaymentCancelled" component={PaymentCancelled} />
      <Stack.Screen name="MyCouponsScreen" component={MyCouponsScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="InvoiceHistoryScreen" component={InvoiceHistoryScreen} />
      <Stack.Screen name="FullReview" component={FullReviewScreen} />




      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
