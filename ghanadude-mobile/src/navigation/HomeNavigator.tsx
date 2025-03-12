import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import MainTabNavigator from "./MainTabNavigator";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

// ✅ Exporting HomeStackParamList so other files can import it
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductScreen: undefined;
  Home: undefined;
  ProductList: undefined;
  ProductDetail: { id: number }; // Ensure 'id' is passed
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
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}
