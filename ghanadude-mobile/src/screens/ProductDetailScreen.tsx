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
import { selectUser } from '../redux/slices/authSlice';
import { StackScreenProps } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { Product } from './types';
import { RootState } from "../redux/store";
import { useNavigation, NavigationProp } from "@react-navigation/native"; 
import { API_BASE_URL } from '../services/AuthService';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/WishlistService';

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

  // ✅ Get the user token from Redux state
  const user = useSelector(selectUser);
  const token = user?.token;

  // ✅ Wishlist state
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
      if (!token) return;

      const wishlist = await getWishlist(token);
      const isItemInWishlist = wishlist.some((item: any) => item.product.id === id);
      setIsWishlisted(isItemInWishlist);
    };

    fetchProduct();
    checkWishlist();
  }, [id, token]);

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

  const toggleWishlist = async () => {
    if (!token) {
      Alert.alert("Login Required", "Please log in to manage your wishlist.");
      return;
    }

    if (isWishlisted) {
      const result = await removeFromWishlist(token, id);
      if (result) {
        setIsWishlisted(false);
        Alert.alert("Removed", `${product?.name} removed from wishlist.`);
      } else {
        Alert.alert("Error", "Failed to remove from wishlist.");
      }
    } else {
      const result = await addToWishlist(token, id);
      if (result) {
        setIsWishlisted(true);
        Alert.alert("Added", `${product?.name} added to wishlist.`);
      } else {
        Alert.alert("Error", "Failed to add to wishlist.");
      }
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
