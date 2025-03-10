import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { View, Text, StyleSheet } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import HomeScreen from "../screens/HomeScreen";
import AccountScreen from "../screens/AccountScreen";
import DealsScreen from "../screens/DealsScreen";
import { RootState } from "../redux/store";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 25,
          height: 75,
        },
      }}
      tabBar={(props) => (
        <View style={styles.tabBarContainer}>
          <LinearGradient colors={["#FCD34D", "#3B82F6"]} style={styles.gradient}>
            <BottomTabBar {...props} style={styles.tabBar} />
          </LinearGradient>
        </View>
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
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
      
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    height: 75,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default MainTabNavigator;
