import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { Product } from './types';
import { API_BASE_URL } from '../services/AuthService';

const ProductListScreen = ({ route, navigation }: any) => {
  const { category, size } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      const query = category !== 'all' ? `?category=${category}` : '';
      const sizeQuery = size ? `${query ? '&' : '?'}size=${size}` : '';
      const response = await fetch(`${API_BASE_URL}/product/products/${query}${sizeQuery}`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [category, size]);

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 p-4`}>
      <ScrollView>
        {products.map((product) => (
          <TouchableOpacity key={product.id} style={tw`mb-4 bg-white shadow rounded-xl`} onPress={() => navigation.navigate('ProductDetail', { id: product.id })}>
            <Image source={{ uri: product.images[0]?.image }} style={tw`h-56 w-full rounded-xl`} />
            <Text style={tw`mt-2 font-bold text-lg`}>{product.name}</Text>
            <Text>R{product.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductListScreen;
