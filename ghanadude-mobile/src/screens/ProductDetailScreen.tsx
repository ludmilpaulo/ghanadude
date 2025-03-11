import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { Product } from '../types';

interface ProductDetailProps {
  route: { params: { id: number } };
  navigation: any;
}

const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route, navigation }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = route.params;

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://www.ghanadude.co.za/product/products/${id}/`);
      const data: Product = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (loading || !product) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView>
        <View style={tw`p-4`}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.image }}
                style={tw`w-80 h-80 rounded-xl mr-2`}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <Text style={tw`text-2xl font-bold mt-4 text-gray-800`}>{product.name}</Text>

          <Text style={tw`text-xl text-gray-600 mt-2`}>
            {product.on_sale ? (
              <>
                <Text style={tw`line-through text-red-500`}>
                  ${product.price}
                </Text>
                <Text style={tw`text-green-600 font-bold ml-2`}>
                  R{(
                    Number(product.price) *
                    (1 - product.discount_percentage / 100)
                  ).toFixed(2)}
                </Text>
                <Text style={tw`ml-2 text-green-600`}>
                  ({product.discount_percentage}% OFF)
                </Text>
              </>
            ) : (
              `R${product.price}`
            )}
          </Text>

          <Text style={tw`mt-3 text-gray-600`}>
            <FontAwesome5 name="layer-group" size={14} /> In Stock: {product.stock}
          </Text>

          <Text style={tw`mt-4 font-semibold text-gray-800`}>Available Sizes:</Text>
          <View style={tw`flex-row flex-wrap mt-2`}>
            {product.sizes.map((size) => (
              <View key={size} style={tw`bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2`}>
                <Text style={tw`capitalize text-gray-700`}>{size}</Text>
              </View>
            ))}
          </View>

          <Text style={tw`text-lg font-semibold mt-4 mb-2 text-gray-800`}>
            Description
          </Text>
          <Text style={tw`text-gray-600`}>{product.description}</Text>

          <TouchableOpacity
            style={tw`mt-6 bg-indigo-600 rounded-xl py-3 items-center`}
            onPress={() => {
              // Handle Add to cart
            }}
          >
            <Text style={tw`text-white text-lg font-semibold`}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
