import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import { RootState } from "../redux/store";
import { updateBasket, decreaseBasket, removeFromBasket } from "../redux/slices/basketSlice";
import { API_BASE_URL } from "../services/AuthService";


const getImageUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.basket.items);

  console.log("Cart Items:", cartItems);

  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold mb-5`}>Shopping Cart</Text>

      {/* If Cart is Empty */}
      {cartItems.length === 0 ? (
        <Text style={tw`text-center text-lg text-gray-500 mt-10`}>Your cart is empty 😞</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {cartItems.map((item, index) => {
            const price = Number(item.price) || 0;
            const imageUrl = getImageUrl(item.image);

            console.log("Image URL:", imageUrl); // Debugging

            return (
              <View key={index} style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-3`}>
                {/* Product Image */}
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={tw`w-16 h-16 rounded-lg mr-3`} />
                ) : (
                  <View style={tw`w-16 h-16 bg-gray-300 rounded-lg mr-3 flex items-center justify-center`}>
                    <FontAwesome name="image" size={20} color="gray" />
                  </View>
                )}

                {/* Product Details */}
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold`} numberOfLines={1}>
                    {item.name || "Unnamed Product"}
                  </Text>
                  <Text style={tw`text-gray-500`}>Size: {item.selectedSize}</Text> {/* ✅ Display Size */}
                  <Text style={tw`text-gray-500`}>R{price.toFixed(2)}</Text>

                  {/* Quantity Controls */}
                  <View style={tw`flex-row items-center mt-2`}>
                    <TouchableOpacity
                      onPress={() => dispatch(decreaseBasket({ id: item.id, selectedSize: item.selectedSize }))}
                      disabled={item.quantity === 1}
                      style={tw`p-2`}
                    >
                      <FontAwesome name="minus-circle" size={20} color={item.quantity > 1 ? "black" : "gray"} />
                    </TouchableOpacity>

                    <Text style={tw`mx-3 text-lg font-semibold`}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() =>
                        dispatch(updateBasket({ id: item.id, selectedSize: item.selectedSize })) // ✅ Fix: Only increases by 1
                      }
                      style={tw`p-2`}
                    >
                      <FontAwesome name="plus-circle" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remove Item */}
                <TouchableOpacity
                  onPress={() => dispatch(removeFromBasket({ id: item.id, selectedSize: item.selectedSize }))}
                  style={tw`p-2`}
                >
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Checkout Section */}
      {cartItems.length > 0 && (
        <View style={tw`border-t border-gray-300 pt-5 mt-5`}>
          <Text style={tw`text-xl font-bold mb-3`}>Total: R{totalPrice.toFixed(2)}</Text>
          <TouchableOpacity style={tw`bg-blue-600 p-4 rounded-lg`}>
            <Text style={tw`text-white text-lg font-semibold text-center`}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
