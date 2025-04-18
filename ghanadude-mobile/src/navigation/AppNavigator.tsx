import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import { LogBox, Alert, ActivityIndicator, View } from "react-native";
import * as Location from "expo-location";
import tw from "twrnc";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function AppNavigator() {
  const user = useSelector(selectUser);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (!user) {
        setPermissionChecked(true);
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📍 Location Access Needed",
          "To make delivery smoother, we need to access your location. This helps us prefill your shipping address and calculate delivery fees accurately.",
          [
            {
              text: "Allow",
              onPress: async () => {
                await Location.requestForegroundPermissionsAsync();
                setPermissionChecked(true);
              },
            },
            {
              text: "Not Now",
              onPress: () => setPermissionChecked(true),
              style: "cancel",
            },
          ]
        );
      } else {
        setPermissionChecked(true);
      }
    };

    requestLocationPermission();
  }, [user]);

  const linking = {
    prefixes: ['ghanadude://'],
    config: {
      screens: {
        ProductDetail: 'product/:id',
        // add others if needed
      },
    },
  };

  if (user && !permissionChecked) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {user ? <HomeNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
