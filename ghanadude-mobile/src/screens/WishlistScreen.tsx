import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import tw from "twrnc";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../services/AuthService";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const userId = user?.user_id;

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/wishlist/`, {
        params: { user_id: userId }
      });
      setWishlist(response.data);
    } catch (err) {
      Alert.alert("Error", "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/product/wishlist/remove/${productId}/`, {
        params: { user_id: userId }
      });
      setWishlist((prev) => prev.filter((item) => item.product?.id !== productId));
    } catch (err) {
      Alert.alert("Error", "Failed to remove item.");
    }
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold mb-5`}>Wishlist</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : wishlist.length === 0 ? (
        <Text style={tw`text-center text-lg text-gray-500 mt-10`}>
          Your wishlist is empty 😞
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {wishlist.map((item, index) => {
            if (!item.product || typeof item.product.price !== "number") {
              return null;
            }

            return (
              <View key={index} style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-3`}>
                {item.product.image ? (
                  <Image source={{ uri: item.product.image }} style={tw`w-16 h-16 rounded-lg mr-3`} />
                ) : (
                  <View style={tw`w-16 h-16 bg-gray-300 rounded-lg mr-3`} />
                )}

                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold`} numberOfLines={1}>
                    {item.product.name || "Unnamed Product"}
                  </Text>
                  <Text style={tw`text-gray-500`}>R{item.product.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity onPress={() => removeFromWishlist(item.product.id)} style={tw`p-2`}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default WishlistScreen;
