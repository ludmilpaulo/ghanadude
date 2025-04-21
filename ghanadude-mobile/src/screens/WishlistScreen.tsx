import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import tw from "twrnc";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { API_BASE_URL } from "../services/AuthService";
import { Swipeable } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { updateBasket } from "../redux/slices/basketSlice";
import { fetchWishlistCount } from "../services/WishlistService";
import { setWishlistCount } from "../redux/slices/wishlistSlice";

// ---------- Interfaces ----------
interface ProductImage {
  id: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  on_sale: boolean;
  bulk_sale: boolean;
  discount_percentage: number;
  stock: number;
  images: ProductImage[];
  sizes?: string[];
}

interface WishlistItem {
  id: number;
  product_price: string;
  added_at: string;
  product: Product;
}

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemState, setItemState] = useState<
    Record<number, { size: string | null; quantity: number }>
  >({});
  const user = useSelector(selectUser);
  const userId = user?.user_id;
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        setLoading(true);
        fetchWishlist();
      }
    }, [userId]),
  );

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/wishlist/`, {
        params: { user_id: userId },
      });
      console.log("✅ Wishlist API Response:", response.data);
      setWishlist(response.data);
    } catch (error) {
      console.error("❌ Wishlist fetch error:", error);
      Alert.alert("Error", "Failed to load wishlist.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/product/wishlist/remove/${productId}/`,
        { params: { user_id: userId } },
      );
      setWishlist((prev) =>
        prev.filter((item) => item.product.id !== productId),
      );
      const newCount = await fetchWishlistCount(userId!);
      dispatch(setWishlistCount(newCount));
    } catch {
      Alert.alert("Error", "Failed to remove item.");
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    const product = item.product;
    const state = itemState[product.id];
    if (!state || !state.size || state.quantity < 1) {
      Alert.alert("Select Options", "Please select a size and quantity.");
      return;
    }

    if (state.quantity > product.stock) {
      Alert.alert("Stock Limit", `Only ${product.stock} items available.`);
      return;
    }

    const discount = product.on_sale
      ? (product.discount_percentage / 100) * Number(product.price)
      : 0;
    const finalPrice = Number(product.price) - discount;

    const cartItem = {
      id: product.id,
      name: product.name,
      selectedSize: state.size,
      quantity: state.quantity,
      image: product.images?.[0]?.image || "",
      price: parseFloat(finalPrice.toFixed(2)),
      originalPrice: Number(product.price),
      stock: product.stock,
    };

    dispatch(updateBasket(cartItem));
    Alert.alert("Added to Cart", `${product.name} added to cart.`);

    await removeFromWishlist(product.id);
  };

  const getImageUrl = (images: ProductImage[]): string => {
    const imagePath = images?.[0]?.image;
    if (!imagePath || typeof imagePath !== "string") {
      return "https://via.placeholder.com/150";
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE_URL}${imagePath}`;
  };

  const renderRightActions = (item: WishlistItem) => (
    <View style={tw`flex-row`}>
      <TouchableOpacity
        onPress={() => moveToCart(item)}
        style={tw`bg-green-600 justify-center items-center px-4 rounded-l-lg`}
      >
        <FontAwesome name="shopping-cart" size={20} color="white" />
        <Text style={tw`text-white text-xs mt-1`}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => removeFromWishlist(item.product.id)}
        style={tw`bg-red-500 justify-center items-center px-4 rounded-r-lg`}
      >
        <FontAwesome name="trash" size={20} color="white" />
        <Text style={tw`text-white text-xs mt-1`}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`p-5`}>
        <Text style={tw`text-2xl font-bold mb-4`}>Wishlist</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={tw`mt-10`} />
      ) : wishlist.length === 0 ? (
        <Text style={tw`text-center text-lg text-gray-500 mt-10`}>
          Your wishlist is empty 😞
        </Text>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={tw`px-5 pb-6`}
          showsVerticalScrollIndicator={false}
        >
          {wishlist.map((item) => {
            const product = item.product;
            const imageUrl = getImageUrl(product.images);
            const price = parseFloat(product.price ?? "0");
            const productName = product.name ?? "Unnamed";

            return (
              <Swipeable
                key={product.id}
                renderRightActions={() => renderRightActions(item)}
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
                    <Text style={tw`text-lg font-semibold`} numberOfLines={1}>
                      {productName}
                    </Text>

                    {product.on_sale ? (
                      <View style={tw`flex-row items-center mt-1`}>
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
                        <View
                          style={tw`ml-2 px-2 py-1 bg-red-200 rounded-full`}
                        >
                          <Text style={tw`text-xs text-red-700 font-bold`}>
                            -{product.discount_percentage}%
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={tw`text-gray-500 mt-1`}>
                        R{price.toFixed(2)}
                      </Text>
                    )}

                    <Text
                      style={tw`text-xs mt-1 ${
                        product.stock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Text>

                    {/* Size Selector */}
                    {Array.isArray(product.sizes) &&
                      product.sizes.length > 0 && (
                        <View style={tw`flex-row flex-wrap mt-2`}>
                          {(product.sizes || []).map((size: string) => (
                            <TouchableOpacity
                              key={size}
                              onPress={() =>
                                setItemState((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    ...prev[product.id],
                                    size,
                                    quantity: prev[product.id]?.quantity || 1,
                                  },
                                }))
                              }
                              style={tw`mr-2 mb-2 px-3 py-1 border rounded-full ${
                                itemState[product.id]?.size === size
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              <Text
                                style={tw`${
                                  itemState[product.id]?.size === size
                                    ? "text-white"
                                    : "text-gray-700"
                                } text-xs`}
                              >
                                {size}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                    {/* Quantity Selector */}
                    <View style={tw`flex-row items-center mt-2`}>
                      <TouchableOpacity
                        onPress={() =>
                          setItemState((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...prev[product.id],
                              quantity: Math.max(
                                1,
                                (prev[product.id]?.quantity || 1) - 1,
                              ),
                              size: prev[product.id]?.size || null,
                            },
                          }))
                        }
                        style={tw`px-3 py-1 bg-gray-200 rounded-l`}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text style={tw`px-3 border-t border-b border-gray-300`}>
                        {itemState[product.id]?.quantity || 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setItemState((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...prev[product.id],
                              quantity: Math.min(
                                product.stock,
                                (prev[product.id]?.quantity || 1) + 1,
                              ),
                              size: prev[product.id]?.size || null,
                            },
                          }))
                        }
                        style={tw`px-3 py-1 bg-gray-200 rounded-r`}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
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
