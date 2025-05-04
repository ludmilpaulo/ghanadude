import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Image } from "expo-image";

import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { updateBasket } from "../redux/slices/basketSlice";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { Product } from "../screens/types";
import { RootState } from "../redux/store";
import Toast from "react-native-toast-message";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

const ProductCard = ({ product }: { product: Product }) => {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const cartItems = useSelector((state: RootState) => state.basket.items);
  const isInCart = cartItems.some(
    (item) => item.id === product.id && item.selectedSize === selectedSize,
  );

  const discountedPrice =
    Number(product.price) * (1 - product.discount_percentage / 100);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const pulseButton = () => {
    scale.value = withRepeat(withTiming(1.1, { duration: 100 }), 2, true);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      selectedSize,
      quantity,
      image: product.images?.[0]?.image || "",
      price: parseFloat(discountedPrice.toFixed(2)),
      originalPrice: Number(product.price),
      stock: product.stock,
    };

    dispatch(updateBasket(cartItem));
    setModalVisible(false);

    Toast.show({
      type: "success",
      text1: "Added to Cart 🛒",
      text2: `${product.name} (Size: ${selectedSize})`,
      position: "bottom",
    });
  };

  return (
    <View
      style={tw`bg-white rounded-2xl shadow-lg p-4 mb-6 w-64 relative mx-2`}
    >
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductDetail", { id: product.id })}
      >
        <Image
          source={{ uri: product.images[0]?.image }}
          style={tw`h-40 w-full rounded-xl`}
          placeholder={{ uri: "https://via.placeholder.com/150?text=Loading..." }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
        {product.discount_percentage > 0 && (
          <View
            style={tw`absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full`}
          >
            <Text style={tw`text-white text-xs font-bold`}>
              -{product.discount_percentage}%
            </Text>
          </View>
        )}
        {product.stock === 0 && (
          <View
            style={tw`absolute inset-0 bg-black bg-opacity-50 rounded-xl justify-center items-center`}
          >
            <Text style={tw`text-white font-bold text-lg`}>Sold Out</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Product Info */}
      <Text
        style={tw`mt-2 font-semibold text-lg text-gray-800`}
        numberOfLines={1}
      >
        {product.name}
      </Text>

      {/* Star Rating */}
      {typeof product.average_rating === "number" && (
        <View style={tw`flex-row items-center mt-1`}>
          {[...Array(5)].map((_, i) => (
            <FontAwesome
              key={i}
              name={i < Math.round(product.average_rating!) ? "star" : "star-o"}
              size={14}
              color="#facc15"
              style={tw`mr-1`}
            />
          ))}
          <Text style={tw`text-gray-500 text-xs ml-1`}>
            ({product.average_rating.toFixed(1)})
          </Text>
        </View>
      )}

      {/* Price */}
      <View style={tw`flex-row items-center mt-1`}>
        {product.discount_percentage > 0 && (
          <Text style={tw`text-gray-400 line-through mr-2 text-sm`}>
            R{product.price}
          </Text>
        )}
        <Text style={tw`text-black font-bold text-lg`}>
          R{discountedPrice.toFixed(2)}
        </Text>
      </View>

      {/* Buttons */}
      <View style={tw`mt-3 flex-row justify-between items-center`}>
        <TouchableOpacity
          style={tw`bg-gray-900 px-3 py-2 rounded-lg flex-row items-center w-[48%] justify-center`}
          onPress={() =>
            navigation.navigate("ProductDetail", { id: product.id })
          }
        >
          <FontAwesome5 name="eye" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`${
            isInCart ? "bg-green-600" : "bg-blue-600"
          } px-3 py-2 rounded-lg flex-row items-center w-[48%] justify-center`}
          onPress={() =>
            isInCart ? navigation.navigate("Cart") : setModalVisible(true)
          }
        >
          <FontAwesome5 name="shopping-cart" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Size & Quantity Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-40`}
        >
          <View style={tw`bg-white p-5 rounded-2xl w-80 shadow-lg`}>
            <Text style={tw`text-lg font-bold mb-3 text-center`}>
              Select Size & Quantity
            </Text>

            {/* Size Picker */}
            <Text style={tw`mb-1 font-semibold`}>Size:</Text>
            <View style={tw`border border-gray-300 rounded-lg mb-4`}>
              <Picker
                selectedValue={selectedSize}
                onValueChange={(itemValue) => setSelectedSize(itemValue)}
              >
                {product.sizes.map((size) => (
                  <Picker.Item key={size} label={size} value={size} />
                ))}
              </Picker>
            </View>

            {/* Quantity */}
            <Text style={tw`mb-1 font-semibold`}>Quantity:</Text>
            <View
              style={tw`flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-2`}
            >
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <FontAwesome name="minus" size={20} color="black" />
              </TouchableOpacity>
              <TextInput
                style={tw`text-center mx-2 text-lg font-semibold w-12`}
                value={quantity.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setQuantity(Number(text) || 1)}
              />
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <FontAwesome name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={tw`flex-row justify-between mt-6`}>
              <TouchableOpacity
                style={tw`px-4 py-2 bg-gray-200 rounded-lg`}
                onPress={() => setModalVisible(false)}
              >
                <Text style={tw`font-semibold text-gray-700`}>Cancel</Text>
              </TouchableOpacity>
              <Animated.View style={[tw`w-[48%]`, animatedStyle]}>
                <TouchableOpacity
                  style={tw`px-4 py-2 bg-blue-600 rounded-lg`}
                  onPress={() => {
                    pulseButton();
                    handleAddToCart();
                  }}
                >
                  <Text style={tw`text-white font-semibold text-center`}>
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductCard;
