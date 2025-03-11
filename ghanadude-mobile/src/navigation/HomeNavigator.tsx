import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigator";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";

import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

const Stack = createStackNavigator();

export default function HomeNavigator() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
  
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
 

     
    </Stack.Navigator>
  );
}