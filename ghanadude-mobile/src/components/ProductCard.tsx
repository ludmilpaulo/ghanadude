import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { updateBasket } from "../redux/slices/basketSlice";
import { HomeStackParamList } from "../navigation/HomeNavigator"; 
import { Product } from "../screens/types";
import { RootState } from "../redux/store";

const ProductCard = ({ product }: { product: Product }) => {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const dispatch = useDispatch();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  // ✅ Get Cart state from Redux
  const cartItems = useSelector((state: RootState) => state.basket.items);

  // ✅ Check if the product is in the cart
  const isInCart = cartItems.some(item => item.id === product.id && item.selectedSize === selectedSize);

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      selectedSize,
      quantity,
      image: product.images?.[0]?.image || "",
    };

    dispatch(updateBasket(cartItem));
    setModalVisible(false);
    alert(`${product.name} (Size: ${selectedSize}) added to cart!`);
  };

  return (
    <View style={tw`bg-white rounded-2xl shadow-lg p-4 mb-6 w-64 relative mx-2`}>

      {/* Product Image */}
      <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { id: product.id })}>
        <Image source={{ uri: product.images[0]?.image }} style={tw`h-40 w-full rounded-xl`} />
      </TouchableOpacity>

      {/* Product Info */}
      <Text style={tw`mt-2 font-semibold text-lg text-gray-800`} numberOfLines={1}>
        {product.name}
      </Text>

      {/* Price Display */}
      <View style={tw`flex-row items-center mt-1`}>
        {product.discount_percentage > 0 && (
          <Text style={tw`text-gray-400 line-through mr-2`}>R{product.price}</Text>
        )}
        <Text style={tw`text-black font-bold text-lg`}>
          R{(Number(product.price) * (1 - product.discount_percentage / 100)).toFixed(2)}
        </Text>
      </View>

      {/* Buttons - Inside the Card */}
      <View style={tw`mt-3 flex-row justify-between items-center`}>
        {/* View Button */}
        <TouchableOpacity
          style={tw`bg-gray-900 px-3 py-2 rounded-lg flex-row items-center w-[48%] justify-center`}
          onPress={() => navigation.navigate("ProductDetail", { id: product.id })}
        >
          <FontAwesome5 name="eye" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>View</Text>
        </TouchableOpacity>

        {/* Cart Button */}
        <TouchableOpacity
          style={tw`${isInCart ? "bg-green-600" : "bg-blue-600"} px-3 py-2 rounded-lg flex-row items-center w-[48%] justify-center`}
          onPress={() => isInCart ? navigation.navigate("Cart") : setModalVisible(true)}
        >
          <FontAwesome5 name="shopping-cart" size={14} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Size & Quantity Selection */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-lg w-80`}>
            <Text style={tw`text-lg font-semibold mb-3`}>Select Size & Quantity</Text>

            {/* Size Selector */}
            <Text style={tw`mb-1 font-semibold`}>Size:</Text>
            <View style={tw`border border-gray-300 rounded-lg mb-3`}>
              <Picker
                selectedValue={selectedSize}
                onValueChange={(itemValue) => setSelectedSize(itemValue)}
              >
                {product.sizes.map((size) => (
                  <Picker.Item key={size} label={size} value={size} />
                ))}
              </Picker>
            </View>

            {/* Quantity Selector */}
            <Text style={tw`mb-1 font-semibold`}>Quantity:</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <FontAwesome name="minus" size={20} color="black" />
              </TouchableOpacity>
              <TextInput
                style={tw`text-center mx-3 text-lg font-semibold`}
                value={quantity.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setQuantity(Number(text) || 1)}
              />
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <FontAwesome name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Modal Actions */}
            <View style={tw`flex-row justify-between mt-5`}>
              <TouchableOpacity
                style={tw`px-4 py-2 bg-gray-300 rounded-lg`}
                onPress={() => setModalVisible(false)}
              >
                <Text style={tw`font-semibold`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`px-4 py-2 bg-blue-600 rounded-lg`}
                onPress={handleAddToCart}
              >
                <Text style={tw`text-white font-semibold`}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductCard;
