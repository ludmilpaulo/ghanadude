import React from "react";
import { View, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface TabCartButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const TabCartButton: React.FC<TabCartButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Ionicons name="cart" color={"#004AAD"} size={27} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: 60,
    width: 60,
    borderRadius: 30,
    bottom: 30,
    borderColor: "#F9F9F9",
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabCartButton;