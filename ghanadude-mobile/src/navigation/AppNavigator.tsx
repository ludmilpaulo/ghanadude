import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import type { AppDispatch } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { fetchProducts, fetchCategories } from "../redux/slices/productSlice";
import HomeNavigator from "./HomeNavigator";
import { LogBox, Alert, ActivityIndicator, View } from "react-native";
import * as Location from "expo-location";
import tw from "twrnc";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function AppNavigator() {
   const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [dataFetched, setDataFetched] = useState(false); // ✅ New state to track data loading

  // ✅ Load products & categories into Redux store
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts()).unwrap(),
          dispatch(fetchCategories()).unwrap(),
        ]);
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    if (user) {
      loadInitialData();
    } else {
      setDataFetched(true); // still allow auth flow if no user
    }
  }, [dispatch, user]);

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
          ],
        );
      } else {
        setPermissionChecked(true);
      }
    };

    requestLocationPermission();
  }, [user]);

  const linking = {
    prefixes: ["ghanadude://"],
    config: {
      screens: {
        ProductDetail: "product/:id",
        // add others if needed
      },
    },
  };

  if ((user && (!permissionChecked || !dataFetched))) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <HomeNavigator />
    </NavigationContainer>
  );
}
