import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import ProductService from '../services/ProductService';
import { NavigationProp } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const categoryIcons: { [key: string]: string } = {
  all: 'tags',
  men: 'male',
  women: 'female',
  kids: 'child',
};

const HomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [products, setProducts] = useState<{ id: string; name: string; image: string; price: number }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://www.ghanadude.co.za/product/categories/');
      const data = await response.json();

      // Avoid duplication by creating unique IDs and removing duplicates
      const uniqueCategories = [
        { id: 'all', name: 'All Products' },
        ...data
      ];

      const deduped = Array.from(new Map(uniqueCategories.map(item => [item.name.toLowerCase(), item])).values());

      setCategories(deduped);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-6 text-black`}>
          Browse Categories
        </Text>

        <View style={tw`flex-row flex-wrap justify-between`}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id.toString()}
              style={tw`bg-white w-[48%] mb-4 rounded-xl shadow py-6 items-center`}
              onPress={() => navigation.navigate('ProductList', { category: cat.name.toLowerCase(), categoryName: cat.name })}
            >
              <FontAwesome5
                name={categoryIcons[cat.name.toLowerCase() as keyof typeof categoryIcons] || 'tag'}
                size={36}
                color="#000"
              />
              <Text style={tw`mt-2 text-lg font-semibold capitalize`}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={tw`text-2xl font-bold mt-6 mb-4 text-black`}>
          On Sale
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={tw`bg-white p-4 rounded-xl shadow mr-4 w-64`}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            >
              <Image source={{ uri: item.image }} style={tw`h-40 w-full rounded-lg`} />
              <Text style={tw`text-lg font-semibold mt-2 text-black`} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={tw`text-gray-700`}>
                ${item.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
