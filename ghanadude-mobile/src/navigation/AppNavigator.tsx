// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function AppNavigator() {
  const user = useSelector(selectUser);

  const linking = {
    prefixes: ['ghanadude://'],
    config: {
      screens: {
        ProductDetail: 'product/:id',
        // add others if needed
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {user ? <HomeNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}