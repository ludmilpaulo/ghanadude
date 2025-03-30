import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
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
import { Order } from '../services/OrderService';




export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductScreen: undefined;
  Home: undefined;
  ProductList: undefined;
  Cart: undefined;
  DealsScreen: undefined;
  CheckoutScreen: undefined;
  SuccessScreen: { order_id: number };
  PaymentCancelled: undefined;
  ProductDetail: { id: number };
  MyCouponsScreen: undefined;
  InvoiceHistoryScreen: undefined;
  OrderHistory:undefined;
  FullReview: { id: number };

  // ✅ Add this line:
  OrderDetail: { order: Order };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {

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
