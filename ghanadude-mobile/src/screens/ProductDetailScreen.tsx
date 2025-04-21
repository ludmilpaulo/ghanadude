import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
  Platform,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp } from "react-native-reanimated";
import tw from "twrnc";
import { FontAwesome, Feather, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updateBasket } from "../redux/slices/basketSlice";
import { selectUser } from "../redux/slices/authSlice";
import { StackScreenProps } from "@react-navigation/stack";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { Product } from "./types";
import { useNavigation } from "@react-navigation/native";
import { fetchWishlistCount } from "../services/WishlistService";
import { setWishlistCount } from "../redux/slices/wishlistSlice";

import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

import { API_BASE_URL } from "../services/AuthService";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/WishlistService";

type ProductDetailProps = StackScreenProps<HomeStackParamList, "ProductDetail">;
const { width } = Dimensions.get("window");

const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route }) => {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const user = useSelector(selectUser);
  const userId = user?.user_id;
  const cartItems = useSelector((state: any) => state.basket.items);
  const isInCart =
    product && selectedSize
      ? cartItems.some(
          (item: any) =>
            item.id === product.id && item.selectedSize === selectedSize,
        )
      : false;

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/product/products/${id}/`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkWishlist = async () => {
      if (!userId) return;
      const wishlist = await getWishlist(userId);
      const isItemInWishlist = wishlist.some(
        (item: any) => item.product.id === id,
      );
      setIsWishlisted(isItemInWishlist);
    };

    fetchProduct();
    checkWishlist();
  }, [id, userId]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/product/products/related/${id}/`,
        );
        const data = await response.json();
        console.log("Related products response:", data);
        setRelatedProducts(data);
      } catch (error) {
        console.error("Failed to load related products:", error);
      } finally {
        setRelatedLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/product/products/${id}/reviews/?user_id=${userId}`,
        );
        const data = await response.json();
        setReviews(data);

        const avg = data.length
          ? data.reduce((sum: number, r: any) => sum + r.rating, 0) /
            data.length
          : 0;

        setAverageRating(parseFloat(avg.toFixed(1)));
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };

    fetchRelated();
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize && product.sizes?.length > 0) {
      Alert.alert("Select Size", "Please choose a size before adding to cart.");
      return;
    }

    if (product.stock === 0) {
      Alert.alert("Out of Stock", "This product is currently out of stock.");
      return;
    }

    const adjustedQuantity = Math.min(quantity, product.stock);

    const discount = product.on_sale
      ? (product.discount_percentage / 100) * Number(product.price)
      : 0;

    const finalPrice = Number(product.price) - discount;

    const cartItem = {
      id: product.id,
      name: product.name,
      selectedSize: selectedSize as string,
      quantity: adjustedQuantity,
      image: product.images?.[0]?.image || "",
      price: parseFloat(finalPrice.toFixed(2)),
      originalPrice: Number(product.price),
      stock: product.stock,
    };

    dispatch(updateBasket(cartItem));

    if (quantity > product.stock) {
      Alert.alert(
        "Quantity Adjusted",
        `Only ${product.stock} items available in stock. Quantity adjusted to ${product.stock}.`,
      );
      setQuantity(product.stock);
    } else {
      Alert.alert("Success", `${product.name} added to cart!`);
    }
  };
  const toggleWishlist = async () => {
    if (!userId) {
      Alert.alert("Login Required", "Please log in to manage your wishlist.");
      return;
    }

    if (isWishlisted) {
      const result = await removeFromWishlist(userId, id);
      if (result) {
        setIsWishlisted(false);
        Alert.alert("Removed", `${product?.name} removed from wishlist.`);
      }
    } else {
      const wishlist = await getWishlist(userId);
      const alreadyExists = wishlist.some(
        (item: any) => item.product.id === id,
      );
      if (alreadyExists) {
        Alert.alert(
          "Already in Wishlist",
          `${product?.name} is already in your wishlist.`,
        );
        setIsWishlisted(true);
        return;
      }

      const result = await addToWishlist(userId, id);
      if (result) {
        setIsWishlisted(true);
        Alert.alert("Added", `${product?.name} added to wishlist.`);
      }
    }

    // 👇 Always update count after action
    const newCount = await fetchWishlistCount(userId);
    dispatch(setWishlistCount(newCount));
  };

  const handleShare = async () => {
    try {
      const universalLink = `${API_BASE_URL}/deeplink/product/${id}`;
      const imageUrl = product?.images?.[0]?.image || null;
      const shareMessage = `🛍️ Check out this product on Ghanadude!\n\n${product?.name}\n${universalLink}`;

      if (!imageUrl) {
        // No image, just share text + link
        await Share.share({
          message: shareMessage,
          title: product?.name,
        });
        return;
      }

      if (Platform.OS === "android") {
        // Android can include image URL in the message
        await Share.share({
          message: `${shareMessage}\n📸 ${imageUrl}`,
          title: product?.name,
        });
      } else {
        // iOS: download and attach the image
        const localUri = `${FileSystem.cacheDirectory}product.jpg`;
        const download = await FileSystem.downloadAsync(imageUrl, localUri);

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) {
          Alert.alert(
            "Sharing not available",
            "Sharing is not supported on this device.",
          );
          return;
        }

        await Sharing.shareAsync(download.uri, {
          dialogTitle: `Check out ${product?.name}`,
          mimeType: "image/jpeg",
          UTI: "public.jpeg", // iOS specific
        });

        // You may also add a separate Share.share() if you want to combine text + link
        // But iOS does not support both image and message natively
      }
    } catch (error) {
      console.error("Sharing failed", error);
      Alert.alert("Error", "Failed to share this product.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <Text style={tw`text-lg font-bold text-gray-700`}>
          Product not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`pb-16`}>
        <View style={tw`flex-row justify-between items-center px-4 pt-4`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`p-2 bg-gray-200 rounded-full`}
          >
            <AntDesign name="arrowleft" size={24} />
          </TouchableOpacity>

          <View style={tw`flex-row`}>
            <TouchableOpacity onPress={toggleWishlist} style={tw`mr-4`}>
              <FontAwesome
                name={isWishlisted ? "heart" : "heart-o"}
                size={24}
                color={isWishlisted ? "red" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Feather name="share-2" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousel with Animation */}
        <Animated.View entering={FadeInUp}>
          <Carousel
            width={width}
            height={width}
            data={product.images || []}
            autoPlay
            autoPlayInterval={5000}
            loop
            scrollAnimationDuration={800}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={tw`w-full h-full rounded-xl`}
                resizeMode="cover"
              />
            )}
          />
        </Animated.View>

        {/* Product Details */}
        <Animated.View entering={FadeInUp.delay(100)} style={tw`p-4`}>
          <Text style={tw`text-3xl font-bold text-gray-900`}>
            {product.name}
          </Text>
          <Text style={tw`text-xl text-green-700 mt-1`}>R{product.price}</Text>
          <Text style={tw`text-sm text-gray-500 mt-1`}>
            Brand: {product.brand}
          </Text>

          {product.on_sale && (
            <Text style={tw`text-sm text-red-500 mt-1`}>
              {product.discount_percentage}% OFF – Save R
              {(
                (Number(product.price) * product.discount_percentage) /
                100
              ).toFixed(2)}
            </Text>
          )}
          <Text
            style={tw`text-sm mt-1 ${product.stock <= 3 ? "text-red-500" : "text-green-600"}`}
          >
            {product.stock === 0
              ? "Out of Stock"
              : product.stock <= 3
                ? "Low Stock"
                : `${product.stock} in stock`}
          </Text>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <View style={tw`mt-6`}>
              <Text style={tw`text-base font-semibold mb-2 text-gray-800`}>
                Select Size
              </Text>
              <View style={tw`flex-row flex-wrap`}>
                {product.sizes.map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={tw`mr-2 mb-2 px-4 py-2 border rounded-full ${selectedSize === size ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                  >
                    <Text
                      style={tw`${selectedSize === size ? "text-white" : "text-gray-800"}`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity with Animation */}
          <Animated.View entering={FadeInUp.delay(200)} style={tw`mt-6`}>
            <Text style={tw`text-base font-semibold mb-2 text-gray-800`}>
              Quantity
            </Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={tw`px-4 py-2 bg-gray-200 rounded-l`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>
              <Text style={tw`px-4 py-2 border-t border-b border-gray-300`}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (quantity < product.stock) {
                    setQuantity((q) => q + 1);
                  } else {
                    Alert.alert(
                      "Stock Limit Reached",
                      `Only ${product.stock} items available.`,
                    );
                  }
                }}
                style={tw`px-4 py-2 bg-gray-200 rounded-r`}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Add to Cart with Animation */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <TouchableOpacity
              onPress={() => {
                if (isInCart) {
                  navigation.navigate("Cart"); // assumes you have a Cart screen in your stack
                } else {
                  handleAddToCart();
                }
              }}
              disabled={product.stock === 0}
              style={tw`mt-6 py-4 rounded-xl shadow-lg ${
                product.stock === 0
                  ? "bg-gray-400"
                  : isInCart
                    ? "bg-blue-600"
                    : "bg-green-600"
              }`}
            >
              <Text style={tw`text-white text-center font-bold text-lg`}>
                {product.stock === 0
                  ? "Out of Stock"
                  : isInCart
                    ? "🛒 Go to Cart"
                    : "🛒 Add to Cart"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Rating with Animation */}
          <Animated.View entering={FadeInUp.delay(400)} style={tw`mt-10`}>
            <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
              ⭐ Rating: {averageRating} / 5
            </Text>
            <View style={tw`flex-row items-center`}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome
                  key={i}
                  name={i < Math.round(averageRating) ? "star" : "star-o"}
                  size={20}
                  color="#fbbf24"
                  style={tw`mr-1`}
                />
              ))}
            </View>
          </Animated.View>

          {/* Reviews */}
          <Animated.View entering={FadeInUp.delay(500)} style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
              Customer Reviews
            </Text>
            {reviews.length === 0 ? (
              <Text style={tw`text-sm text-gray-500`}>No reviews yet.</Text>
            ) : (
              reviews.map((review) => (
                <View
                  key={review.id}
                  style={tw`mb-4 bg-gray-100 p-3 rounded-lg`}
                >
                  <Text style={tw`font-semibold text-gray-700`}>
                    {review.user}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    {review.comment}
                  </Text>
                  <Text style={tw`text-xs text-gray-400 mt-1`}>
                    {review.date}
                  </Text>
                </View>
              ))
            )}
          </Animated.View>

          {/* Related Products */}
          <Animated.View entering={FadeInUp.delay(600)} style={tw`mt-10`}>
            <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>
              You May Also Like
            </Text>
            {relatedLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    style={tw`mr-4 w-40 h-40 bg-gray-200 rounded-xl`}
                  />
                ))}
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relatedProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      navigation.push("ProductDetail", { id: item.id })
                    }
                    style={tw`mr-4 w-40 bg-white rounded-xl shadow p-2`}
                  >
                    <Image
                      source={{
                        uri:
                          item.images && item.images.length > 0
                            ? item.images[0].image
                            : "https://via.placeholder.com/150",
                      }}
                      style={tw`w-full h-28 rounded-lg`}
                      resizeMode="cover"
                    />

                    <Text
                      style={tw`mt-2 text-sm font-semibold text-gray-800`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={tw`text-xs text-green-700`}>
                      R{Number(item.price).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
