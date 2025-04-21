// components/DeliverySelector.tsx

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

interface Props {
  selected: "delivery" | "collection";
  onChange: (type: "delivery" | "collection") => void;
}

const DeliverySelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <View style={tw`mt-4`}>
      <Text style={tw`font-bold mb-2`}>Choose Delivery Option:</Text>
      {["delivery", "collection"].map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => onChange(type as "delivery" | "collection")}
          style={tw`p-3 mb-2 rounded-lg ${selected === type ? "bg-green-600" : "bg-gray-200"}`}
        >
          <Text
            style={tw`${selected === type ? "text-white" : "text-gray-800"} text-center`}
          >
            {type === "delivery" ? "🚚 Delivery" : "🏬 Collect from Store"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default DeliverySelector;
