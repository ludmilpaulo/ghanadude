import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
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
import {
 
  setBrandLogo,
  setCustomDesign,
  setBrandLogoQty,
  setCustomDesignQty,
  selectDesign,
} from "../redux/slices/designSlice";
import { API_BASE_URL } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList, "CartScreen">;

const { width } = Dimensions.get("window");

const BRAND_LOGO_PRICE = 50;
const CUSTOM_DESIGN_PRICE = 100;

const getImageUrl = (image?: string | null): string | undefined => {
  if (!image) return undefined;
  if (image.startsWith("http") || image.startsWith("file://")) return image;
  return encodeURI(`${API_BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`);
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useSelector((state: RootState) => state.basket.items);

  const {
    brandLogo,
    customDesign,
    brandLogoQty,
    customDesignQty,
  } = useSelector(selectDesign);

  const safeBrandQty = brandLogoQty ?? 1;
  const safeDesignQty = customDesignQty ?? 1;

  const handleDecrease = (item: CartItem) => {
    if (item.isBulk && item.quantity <= 10) {
      Alert.alert("Minimum Bulk Quantity", "Bulk orders cannot have less than 10 items.");
      return;
    }
    dispatch(decreaseBasket({ id: item.id, selectedSize: item.selectedSize, isBulk: item.isBulk }));
  };

  const handleIncrease = (item: CartItem) => {
    dispatch(updateBasket({ ...item, quantity: 1 }));
  };

  const handleDelete = (item: CartItem) => {
    Alert.alert(
      "Remove Item",
      `Remove ${item.name} (${item.selectedSize}) from your cart?`,
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

  const handleDeleteDesign = (type: "logo" | "custom") => {
    Alert.alert(
      "Remove Image",
      `Remove the ${type === "logo" ? "Brand Logo" : "Custom Design"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (type === "logo") {
              dispatch(setBrandLogo(null));
              dispatch(setBrandLogoQty(1));
            }
            if (type === "custom") {
              dispatch(setCustomDesign(null));
              dispatch(setCustomDesignQty(1));
            }
          },
        },
      ]
    );
  };

  const baseTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const logoTotal = brandLogo ? BRAND_LOGO_PRICE * safeBrandQty : 0;
  const designTotal = customDesign ? CUSTOM_DESIGN_PRICE * safeDesignQty : 0;
  const totalPrice = baseTotal + logoTotal + designTotal;

  return (
    <View style={tw`flex-1 bg-white pt-12 px-5`}>
      <TouchableOpacity
        style={tw`absolute top-10 left-5 z-10 bg-white p-3 rounded-full shadow`}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>

      <Text style={tw`text-3xl font-bold text-center mb-6`}>🛒 Your Cart</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 && !brandLogo && !customDesign ? (
          <View style={tw`flex-1 justify-center items-center mt-20`}>
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
            {/* Regular Items */}
            {cartItems.map((item) => {
              const imageUrl = getImageUrl(item.image);
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
                      <Text style={tw`text-lg font-bold text-gray-800`} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={tw`text-gray-600 text-sm mb-1`}>
                        Size: {item.selectedSize} {item.isBulk && "(Bulk Order ✨)"}
                      </Text>
                      <Text style={tw`text-blue-700 font-bold`}>
                        R{Number(item.price).toFixed(2)}
                      </Text>
                      <View style={tw`flex-row items-center mt-2`}>
                        <TouchableOpacity onPress={() => handleDecrease(item)} style={tw`p-1`}>
                          <FontAwesome name="minus-circle" size={22} color={item.isBulk && item.quantity <= 10 ? "gray" : "black"} />
                        </TouchableOpacity>
                        <Text style={tw`mx-3 text-lg font-semibold`}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleIncrease(item)} style={tw`p-1`}>
                          <FontAwesome name="plus-circle" size={22} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={tw`ml-3`}>
                      <FontAwesome name="trash" size={22} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Brand Logo */}
            {brandLogo && (
              <View style={tw`bg-white border rounded-xl p-4 mb-4 shadow`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-lg font-bold text-gray-800`}>Brand Logo</Text>
                  <TouchableOpacity onPress={() => handleDeleteDesign("logo")}>
                    <FontAwesome name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
                <Image
                  source={{ uri: getImageUrl(brandLogo) }}
                  style={[tw`rounded-lg`, { width: width - 50, height: 150 }]}
                  resizeMode="contain"
                />
                <Text style={tw`text-gray-700 font-semibold mt-2`}>
                  R{BRAND_LOGO_PRICE} × {safeBrandQty} = R{BRAND_LOGO_PRICE * safeBrandQty}
                </Text>
                <View style={tw`flex-row justify-center mt-2`}>
                  <TouchableOpacity
                    onPress={() => dispatch(setBrandLogoQty(Math.max(1, safeBrandQty - 1)))}
                    style={tw`p-1`}
                  >
                    <FontAwesome name="minus-circle" size={22} />
                  </TouchableOpacity>
                  <Text style={tw`mx-3 text-lg font-semibold`}>{safeBrandQty}</Text>
                  <TouchableOpacity
                    onPress={() => dispatch(setBrandLogoQty(safeBrandQty + 1))}
                    style={tw`p-1`}
                  >
                    <FontAwesome name="plus-circle" size={22} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Custom Design */}
            {customDesign && (
              <View style={tw`bg-white border rounded-xl p-4 mb-4 shadow`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-lg font-bold text-gray-800`}>Custom Design</Text>
                  <TouchableOpacity onPress={() => handleDeleteDesign("custom")}>
                    <FontAwesome name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
                <Image
                  source={{ uri: getImageUrl(customDesign) }}
                  style={[tw`rounded-lg`, { width: width - 50, height: 150 }]}
                  resizeMode="contain"
                />
                <Text style={tw`text-gray-700 font-semibold mt-2`}>
                  R{CUSTOM_DESIGN_PRICE} × {safeDesignQty} = R{CUSTOM_DESIGN_PRICE * safeDesignQty}
                </Text>
                <View style={tw`flex-row justify-center mt-2`}>
                  <TouchableOpacity
                    onPress={() => dispatch(setCustomDesignQty(Math.max(1, safeDesignQty - 1)))}
                    style={tw`p-1`}
                  >
                    <FontAwesome name="minus-circle" size={22} />
                  </TouchableOpacity>
                  <Text style={tw`mx-3 text-lg font-semibold`}>{safeDesignQty}</Text>
                  <TouchableOpacity
                    onPress={() => dispatch(setCustomDesignQty(safeDesignQty + 1))}
                    style={tw`p-1`}
                  >
                    <FontAwesome name="plus-circle" size={22} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {(cartItems.length > 0 || brandLogo || customDesign) && (
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
      )}
    </View>
  );
};

export default CartScreen;
