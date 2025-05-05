import React, { useEffect, useRef } from "react";
import { BottomTabBar, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, AntDesign, MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { View, Text, Animated, Easing, SafeAreaView} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

import HomeScreen from "../screens/HomeScreen";
import AccountScreen from "../screens/AccountScreen";
import DealsScreen from "../screens/DealsScreen";
import CartScreen from "../screens/CartScreen";
import WishlistScreen from "../screens/WishlistScreen";
import CustomizeScreen from "../screens/CustomizeScreen";

import { fetchWishlistCount } from "../services/WishlistService";
import { setWishlistCount } from "../redux/slices/wishlistSlice";
import { RootState } from "../redux/store";
import { selectUser } from "../redux/slices/authSlice";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.count);
  const user = useSelector(selectUser);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const userId = user?.user_id;

  // 🌀 Create animated values for cart and wishlist badges
  const cartPulseAnim = useRef(new Animated.Value(1)).current;
  const wishlistPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (userId) {
      fetchWishlistCount(userId).then((count) =>
        dispatch(setWishlistCount(count)),
      );
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (cartCount > 0) {
      startPulseAnimation(cartPulseAnim);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      startPulseAnimation(wishlistPulseAnim);
    }
  }, [wishlistCount]);

  const startPulseAnimation = (animationValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.3,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#fff",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            paddingBottom: 10,
            height: 75,
          },
        }}
        tabBar={(props) => (
          <View>
            <LinearGradient
              colors={["#000", "#000", "#000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 75 }}
            >
              <BottomTabBar {...props} />
            </LinearGradient>
          </View>
        )}
      >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: (p) => <AntDesign name="home" {...p} /> }}
      />
      <Tab.Screen
        name="Deals"
        component={DealsScreen}
        options={{ tabBarIcon: (p) => <MaterialIcons name="local-offer" {...p} /> }}
      />
      <Tab.Screen
        name="Customize"
        component={CustomizeScreen}
        options={{ tabBarIcon: (p) => <Ionicons name="brush" {...p} /> }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <FontAwesome name="shopping-cart" color={color} size={size} />
              {cartCount > 0 && (
                <Animated.View style={{
                  position: "absolute", top: -5, right: -10,
                  backgroundColor: "red", borderRadius: 10,
                  width: 18, height: 18,
                  justifyContent: "center", alignItems: "center",
                  transform: [{ scale: cartPulseAnim }],
                }}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>{cartCount}</Text>
                </Animated.View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <FontAwesome name="heart" color={color} size={size} />
              {wishlistCount > 0 && (
                <Animated.View style={{
                  position: "absolute", top: -5, right: -10,
                  backgroundColor: "red", borderRadius: 10,
                  width: 18, height: 18,
                  justifyContent: "center", alignItems: "center",
                  transform: [{ scale: wishlistPulseAnim }],
                }}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>{wishlistCount}</Text>
                </Animated.View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: (p) => <Feather name="user" {...p} /> }}
      />
    </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainTabNavigator;
