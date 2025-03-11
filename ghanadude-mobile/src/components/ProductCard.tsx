import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Product } from "../types";

const ProductCard = ({ product }: { product: Product }) => {
  const navigation = useNavigation();
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <View style={tw`bg-white rounded-2xl shadow-lg p-4 mb-6 w-[48%]`}>
      {/* Product Image */}
      <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { id: product.id })}>
        <Image source={{ uri: product.images[0]?.image }} style={tw`h-48 w-full rounded-2xl`} />
      </TouchableOpacity>

      {/* Product Name */}
      <Text style={tw`mt-2 font-semibold text-lg text-gray-900`} numberOfLines={1}>
        {product.name}
      </Text>

      {/* Price Section */}
      <View style={tw`flex-row items-center mt-1`}>
        <Text style={tw`text-gray-400 line-through mr-2`}>R{product.price}</Text>
        <Text style={tw`text-green-600 font-bold text-lg`}>
          R{(Number(product.price) * (1 - product.discount_percentage / 100)).toFixed(2)}
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={tw`mt-3 flex-row justify-between items-center`}>
        {/* View Product */}
        <TouchableOpacity
          style={tw`bg-blue-600 px-4 py-2 rounded-xl flex-row items-center`}
          onPress={() => navigation.navigate("ProductDetail", { id: product.id })}
        >
          <FontAwesome5 name="eye" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>View</Text>
        </TouchableOpacity>

        {/* Add to Cart */}
        <TouchableOpacity style={tw`bg-green-500 px-4 py-2 rounded-xl flex-row items-center`}>
          <FontAwesome5 name="shopping-cart" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>Cart</Text>
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity
          style={tw`p-3 rounded-full ${isWishlisted ? "bg-red-100" : "bg-gray-200"}`}
          onPress={() => setIsWishlisted(!isWishlisted)}
        >
          <FontAwesome name={isWishlisted ? "heart" : "heart-o"} size={16} color={isWishlisted ? "red" : "gray"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductCard;
