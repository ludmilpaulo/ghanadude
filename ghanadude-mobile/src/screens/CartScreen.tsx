import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { RootState } from "../redux/store";
import { updateBasket, decreaseBasket, removeFromBasket } from "../redux/slices/basketSlice";
import { API_BASE_URL } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList, "CartScreen">;

const getImageUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useSelector((state: RootState) => state.basket.items);

  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <TouchableOpacity
        style={tw`absolute top-10 left-5 z-10 bg-white p-3 rounded-full shadow-md`}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>

      <Text style={tw`text-2xl font-bold mb-5 text-center`}>Shopping Cart</Text>

      {cartItems.length === 0 ? (
        <Text style={tw`text-center text-lg text-gray-500 mt-10`}>Your cart is empty 😞</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {cartItems.map((item, index) => {
            const imageUrl = getImageUrl(item.image);
            return (
              <View key={index} style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-3`}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={tw`w-16 h-16 rounded-lg mr-3`} />
                ) : (
                  <View style={tw`w-16 h-16 bg-gray-300 rounded-lg mr-3 flex items-center justify-center`}>
                    <FontAwesome name="image" size={20} color="gray" />
                  </View>
                )}

                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold`} numberOfLines={1}>
                    {item.name || "Unnamed Product"}
                  </Text>
                  <Text style={tw`text-gray-500`}>Size: {item.selectedSize}</Text>
                  <Text style={tw`text-gray-500`}>R{Number(item.price).toFixed(2)}</Text>

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
                      onPress={() => dispatch(updateBasket({ id: item.id, selectedSize: item.selectedSize }))}
                      style={tw`p-2`}
                    >
                      <FontAwesome name="plus-circle" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

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

      {cartItems.length > 0 && (
        <View style={tw`border-t border-gray-300 pt-5 mt-5`}>
          <Text style={tw`text-xl font-bold mb-3`}>Total: R{totalPrice.toFixed(2)}</Text>
          <TouchableOpacity
            style={tw`bg-blue-600 p-4 rounded-lg`}
            onPress={() => navigation.navigate("CheckoutScreen")} // ✅ Navigates to Checkout
          >
            <Text style={tw`text-white text-lg font-semibold text-center`}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
