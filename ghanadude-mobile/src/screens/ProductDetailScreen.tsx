import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { updateBasket } from '../redux/slices/basketSlice';
import { StackScreenProps } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator"; // ✅ Import HomeStackParamList correctly

type ProductDetailProps = StackScreenProps<HomeStackParamList, "ProductDetail">;

const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route, navigation }) => {
  const { id } = route.params; // Extract 'id' safely
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://www.ghanadude.co.za/product/products/${id}/`);
        const data = await response.json();
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
    if (product) {
      dispatch(updateBasket(product));
      Alert.alert("Success", `${product.name} added to cart!`);
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`pb-10`}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(img) => img.id.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item.image }} style={tw`w-full h-96 rounded-xl`} resizeMode="cover" />
          )}
        />
        <View style={tw`px-5 mt-5`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>{product.name}</Text>
          <View style={tw`flex-row items-center mt-2`}>
            {product.on_sale ? (
              <>
                <Text style={tw`text-lg text-red-500 line-through mr-2`}>R{Number(product.price).toFixed(2)}</Text>
                <Text style={tw`text-xl text-green-600 font-bold`}>
                  R{(Number(product.price) * (1 - Number(product.discount_percentage) / 100)).toFixed(2)}
                </Text>
                <Text style={tw`ml-2 text-green-600`}>({Number(product.discount_percentage)}% OFF)</Text>
              </>
            ) : (
              <Text style={tw`text-xl font-semibold text-gray-800`}>R{Number(product.price).toFixed(2)}</Text>
            )}
          </View>

          <View style={tw`flex-row items-center mt-2`}>
            <FontAwesome5 name="layer-group" size={16} color="#4f46e5" />
            <Text style={tw`ml-2 text-gray-700 font-medium`}>
              In Stock: {product.stock > 0 ? product.stock : "Out of stock"}
            </Text>
          </View>

          <TouchableOpacity style={tw`mt-6 bg-indigo-600 rounded-xl py-4 items-center shadow-md flex-row justify-center`} onPress={handleAddToCart}>
            <Feather name="shopping-cart" size={20} color="white" />
            <Text style={tw`text-white text-lg font-semibold ml-2`}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
