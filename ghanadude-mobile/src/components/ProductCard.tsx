import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { SharedElement } from "react-navigation-shared-element";

import { Product } from "../screens/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/HomeNavigator";

import tw from "twrnc";

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 80 }}
      style={tw`bg-white rounded-xl shadow-md p-4 w-60 mr-4`}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductDetail", { id: product.id })
        }
      >
        <SharedElement id={`product.${product.id}.image`}>
          <Image
            source={{ uri: product.images[0]?.image }}
            style={tw`h-40 w-full rounded-xl mb-2`}
            resizeMode="cover"
          />
        </SharedElement>
        <Text style={tw`font-bold text-lg text-gray-800`} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={tw`text-green-700 font-semibold`}>
          R{Number(product.price).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
};

export default ProductCard;
