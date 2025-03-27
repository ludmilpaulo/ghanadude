import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { RootState } from "../redux/store";
import {
  updateBasket,
  decreaseBasket,
  removeFromBasket,
  CartItem,
} from "../redux/slices/basketSlice";
import { API_BASE_URL } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList, "CartScreen">;

const getImageUrl = (image?: string | null): string | undefined => {
  if (!image) return undefined;
  if (image.startsWith("http")) return image;
  return encodeURI(`${API_BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`);
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useSelector((state: RootState) => state.basket.items);

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const handleDecrease = (item: CartItem) => {
    if (item.isBulk && item.quantity <= 10) {
      Alert.alert("Minimum Bulk Quantity", "Bulk orders cannot have less than 10 items.");
      return;
    }
    dispatch(decreaseBasket({ id: item.id, selectedSize: item.selectedSize, isBulk: item.isBulk }));
  };

  const handleDelete = (item: CartItem) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove ${item.name} (${item.selectedSize}) from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            dispatch(removeFromBasket({ id: item.id, selectedSize: item.selectedSize, isBulk: item.isBulk }));
          },
        },
      ]
    );
  };

  return (
    <View style={tw`flex-1 bg-white pt-12 px-5`}>
      <TouchableOpacity
        style={tw`absolute top-10 left-5 z-10 bg-white p-3 rounded-full shadow`}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>

      <Text style={tw`text-3xl font-bold text-center mb-6`}>🛒 Your Cart</Text>

      {cartItems.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <FontAwesome name="shopping-cart" size={50} color="gray" />
          <Text style={tw`text-xl mt-4 text-gray-600 text-center`}>
            Your cart is empty 😞{"\n"}Let’s fix that!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mt-6 bg-blue-600 px-6 py-3 rounded-full shadow`}
          >
            <Text style={tw`text-white font-bold text-base`}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => {
              const imageUrl = getImageUrl(item.image);
              const logoUrl = getImageUrl(item.brandLogo);
              const customDesignUrl = getImageUrl(item.customDesign);

              return (
                <View key={`${item.id}-${item.selectedSize}`} style={tw`bg-gray-100 p-4 rounded-xl mb-4 shadow-lg`}>
                  <View style={tw`flex-row items-center`}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={tw`w-20 h-20 rounded-lg mr-4`} />
                    ) : (
                      <View style={tw`w-20 h-20 bg-gray-300 rounded-lg mr-4 justify-center items-center`}>
                        <FontAwesome name="image" size={20} color="gray" />
                      </View>
                    )}

                    <View style={tw`flex-1`}>
                      <Text style={tw`text-lg font-bold text-gray-800`} numberOfLines={1}>{item.name}</Text>
                      <Text style={tw`text-gray-600 text-sm mb-1`}>
                        Size: {item.selectedSize} {item.isBulk && "(Bulk Order ✨)"}
                      </Text>
                      <Text style={tw`text-blue-700 font-bold`}>
                        R{Number(item.price).toFixed(2)}
                      </Text>

                      <View style={tw`flex-row items-center mt-2`}>
                        <TouchableOpacity onPress={() => handleDecrease(item)} style={tw`p-1`}>
                          <FontAwesome
                            name="minus-circle"
                            size={22}
                            color={item.isBulk && item.quantity <= 10 ? "gray" : "black"}
                          />
                        </TouchableOpacity>
                        <Text style={tw`mx-3 text-lg font-semibold`}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => dispatch(updateBasket({ ...item, quantity: 1 }))} style={tw`p-1`}>
                          <FontAwesome name="plus-circle" size={22} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => handleDelete(item)} style={tw`ml-3`}>
                      <FontAwesome name="trash" size={22} color="red" />
                    </TouchableOpacity>
                  </View>

                  {(logoUrl || customDesignUrl) && (
                    <View style={tw`flex-row justify-start mt-4`}>
                      {logoUrl && (
                        <View style={tw`items-center mr-4`}>
                          <Image source={{ uri: logoUrl }} style={tw`w-16 h-16 rounded-lg`} />
                          <Text style={tw`text-xs text-gray-600 mt-1`}>Brand Logo</Text>
                        </View>
                      )}
                      {customDesignUrl && (
                        <View style={tw`items-center`}>
                          <Image source={{ uri: customDesignUrl }} style={tw`w-16 h-16 rounded-lg`} />
                          <Text style={tw`text-xs text-gray-600 mt-1`}>Custom Design</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={tw`border-t border-gray-200 pt-5 mt-4`}>
            <Text style={tw`text-xl font-bold mb-3 text-right`}>
              Total: R{totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={tw`bg-green-600 py-4 rounded-xl shadow-lg`}
              onPress={() => navigation.navigate("CheckoutScreen")}
            >
              <Text style={tw`text-white text-center font-bold text-lg`}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;
