import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <MaterialIcons name="info-outline" size={20} color="#78350f" />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={tw`flex-1 bg-black bg-opacity-40 justify-center items-center`}
          onPress={() => setVisible(false)}
        >
          <View style={tw`bg-gray-800 px-4 py-3 rounded-lg max-w-3/4`}>
            <Text style={tw`text-white text-sm text-center`}>{text}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default InfoTooltip;
