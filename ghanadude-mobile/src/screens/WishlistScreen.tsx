import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import tw from "twrnc";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { API_BASE_URL } from "../services/AuthService";
import { Swipeable } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const userId = user?.user_id;
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/wishlist/`, {
        params: { user_id: userId },
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
      await axios.delete(
        `${API_BASE_URL}/product/wishlist/remove/${productId}/`,
        { params: { user_id: userId } }
      );
      setWishlist((prev) =>
        prev.filter((item) => item.product?.id !== productId)
      );
    } catch (err) {
      Alert.alert("Error", "Failed to remove item.");
    }
  };

  const getImageUrl = (images: any[]): string => {
    const imagePath = images?.[0]?.image;
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE_URL}${imagePath}`;
  };

  const renderRightActions = (productId: number) => (
    <TouchableOpacity
      onPress={() => removeFromWishlist(productId)}
      style={tw`bg-red-500 justify-center items-center px-5 rounded-r-lg`}
    >
      <FontAwesome name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

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
            const product = item.product;
            if (!product) return null;

            const imageUrl = getImageUrl(product.images || []);
            const price = parseFloat(product.price || "0");
            const productName = product.name || "Unnamed";

            return (
              <Swipeable
                key={index}
                renderRightActions={() => renderRightActions(product.id)}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProductDetail", { id: product.id })
                  }
                  style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-3`}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={tw`w-16 h-16 rounded-lg mr-3`}
                    resizeMode="cover"
                  />

                  <View style={tw`flex-1`}>
                    <Text
                      style={tw`text-lg font-semibold`}
                      numberOfLines={1}
                    >
                      {productName}
                    </Text>

                    {product.on_sale ? (
                      <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-red-600 font-bold mr-2`}>
                          R
                          {(
                            price -
                            (price * product.discount_percentage) / 100
                          ).toFixed(2)}
                        </Text>
                        <Text style={tw`text-xs line-through text-gray-400`}>
                          R{price.toFixed(2)}
                        </Text>
                        <View style={tw`ml-2 px-2 py-1 bg-red-200 rounded-full`}>
                          <Text style={tw`text-xs text-red-700 font-bold`}>
                            -{product.discount_percentage}%
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={tw`text-gray-500`}>
                        R{price.toFixed(2)}
                      </Text>
                    )}
                  </View>

                  <FontAwesome name="chevron-right" size={16} color="#ccc" />
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default WishlistScreen;
