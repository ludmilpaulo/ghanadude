import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator,
  SafeAreaView, TouchableOpacity, Alert, Dimensions
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import tw from 'twrnc';
import { FontAwesome, Feather, AntDesign } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateBasket } from '../redux/slices/basketSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { StackScreenProps } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { Product } from './types';
import { RootState } from "../redux/store";
import { useNavigation, NavigationProp } from "@react-navigation/native"; 
import { API_BASE_URL } from '../services/AuthService';

type ProductDetailProps = StackScreenProps<HomeStackParamList, "ProductDetail">;

const { width } = Dimensions.get("window");

const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route }) => {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();

  // ✅ Get wishlist & cart items from Redux store
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);
  const cartItems = useSelector((state: RootState) => state.basket.items);

  // ✅ Check if the product is in the wishlist
  const isWishlisted = wishlistItems.includes(id);
  // ✅ Check if the product is in the cart
  const isInCart = cartItems.some(item => item.id === id && item.selectedSize === selectedSize);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/product/products/${id}/`);
        const data = await response.json();
        console.log("API response==>", data);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      Alert.alert("Select Size", "Please choose a size before adding to cart.");
      return;
    }

    const cartItem = {
      ...product,
      selectedSize,
      quantity,
      image: product.images?.[0]?.image,
    };

    dispatch(updateBasket(cartItem));
    Alert.alert("Success", `${product.name} (Size: ${selectedSize}) added to cart!`);
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(id));
      Alert.alert("Removed", `${product?.name} removed from wishlist.`);
    } else {
      dispatch(addToWishlist(id));
      Alert.alert("Added", `${product?.name} added to wishlist.`);
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
        <Text style={tw`text-lg font-bold text-gray-700`}>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView contentContainerStyle={tw`pb-10`}>

        {/* 🔙 Back Button */}
        <TouchableOpacity
          style={tw`absolute top-10 left-5 z-10 bg-white p-3 rounded-full shadow-md`}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        {/* ❤️ Wishlist Button */}
        <TouchableOpacity
          style={tw`absolute top-10 right-5 z-10 bg-white p-3 rounded-full shadow-md`}
          onPress={toggleWishlist}
        >
          <FontAwesome name={isWishlisted ? "heart" : "heart-o"} size={24} color={isWishlisted ? "red" : "black"} />
        </TouchableOpacity>

        {/* Image Carousel */}
        <View style={tw`items-center`}>
          <Carousel
            loop
            width={width}
            height={400}
            autoPlay={true}
            autoPlayInterval={4000}
            data={product.images || []}
            scrollAnimationDuration={800}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={tw`w-full h-96 rounded-xl`}
                resizeMode="cover"
              />
            )}
          />
        </View>

        {/* Product Details */}
        <View style={tw`px-5 mt-5`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>{product.name}</Text>

          {/* Pricing Section */}
          <View style={tw`flex-row items-center mt-2`}>
            {product.on_sale ? (
              <>
                <Text style={tw`text-lg text-red-500 line-through mr-2`}>
                  R{Number(product.price).toFixed(2)}
                </Text>
                <Text style={tw`text-xl text-green-600 font-bold`}>
                  R{(Number(product.price) * (1 - Number(product.discount_percentage) / 100)).toFixed(2)}
                </Text>
                <Text style={tw`ml-2 text-green-600`}>
                  ({Number(product.discount_percentage)}% OFF)
                </Text>
              </>
            ) : (
              <Text style={tw`text-xl font-semibold text-gray-800`}>
                R{Number(product.price).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Size Selection */}
          <Text style={tw`mt-5 text-lg font-semibold text-gray-800`}>Select Size:</Text>
          <View style={tw`flex-row flex-wrap mt-2`}>
            {product.sizes?.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={tw`px-4 py-2 rounded-lg mr-2 mb-2 ${
                  selectedSize === size ? "bg-indigo-600" : "bg-gray-200"
                }`}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={tw`${selectedSize === size ? "text-white" : "text-gray-800"} font-semibold`}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cart Button */}
          <TouchableOpacity
            style={tw`mt-6 ${!selectedSize ? "bg-gray-400" : isInCart ? "bg-green-600" : "bg-indigo-600"} rounded-xl py-4 items-center shadow-md flex-row justify-center`}
            onPress={() => isInCart ? navigation.navigate("Cart") : handleAddToCart()}
            disabled={!selectedSize}
          >
            <Feather name="shopping-cart" size={20} color="white" />
            <Text style={tw`text-white text-lg font-semibold ml-2`}>
              {!selectedSize ? "Select Size First" : isInCart ? "Go to Cart" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
