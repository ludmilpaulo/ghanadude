import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";

import { View, Text, SafeAreaView } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import HomeScreen from "../screens/HomeScreen";
import AccountScreen from "../screens/AccountScreen";
import DealsScreen from "../screens/DealsScreen";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlistCount } from "../services/WishlistService";
import { setWishlistCount } from "../redux/slices/wishlistSlice";



import { RootState } from "../redux/store";
import CartScreen from "../screens/CartScreen";
import WishlistScreen from "../screens/WishlistScreen";
import { selectUser } from "../redux/slices/authSlice";



const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const wishlistCount = useSelector((state: RootState) => state.wishlist.count);

  const user = useSelector(selectUser);
  const userId = user?.user_id;
  
  useEffect(() => {
    if (userId) {
      fetchWishlistCount(userId).then((count) => dispatch(setWishlistCount(count)));
    }
  }, [userId]);
  


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#000",
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
            colors={["#e60000", "#ffcc00", "#008000"]}
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
          options={{
            tabBarIcon: ({ color, size }) => <AntDesign name="home" color={color} size={size} />,
          }}
        />

        <Tab.Screen
          name="Deals"
          component={DealsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="local-offer" color={color} size={size} />
            ),
          }}
        />

        {cartCount > 0 && (
          <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <FontAwesome name="shopping-cart" color={color} size={size} />
                {cartCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      backgroundColor: "red",
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        
        )}

        <Tab.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <FontAwesome name="heart" color={color} size={size} />
                {wishlistCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      backgroundColor: "red",
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
                      {wishlistCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainTabNavigator;
