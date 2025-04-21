import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import ProductService from "../services/ProductService";

// Define types
type ProductImage = {
  id: number;
  image: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: number;
  stock: number;
  onSale: boolean;
  discountPercentage: number;
  season: string;
  images: ProductImage[];
};

type Category = {
  id: number;
  name: string;
};

const ProductScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fadeIn();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response: Product[] = await ProductService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response: Category[] = await ProductService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 px-4`}>
      <View style={tw`py-4`}>
        {/* Search Input */}
        <View
          style={tw`flex-row items-center bg-white p-3 rounded-lg shadow-md mb-4`}
        >
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={tw`flex-1 ml-2 text-base`}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Picker */}
        <View
          style={tw`bg-white p-3 rounded-lg shadow-md mb-4 flex-row items-center`}
        >
          <Ionicons name="list" size={20} color="gray" style={tw`mr-2`} />
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={tw`flex-1`}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map((cat) => (
              <Picker.Item
                key={cat.id}
                label={cat.name}
                value={cat.id.toString()}
              />
            ))}
          </Picker>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={tw`flex-row flex-wrap justify-between`}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Animated.View
                  key={product.id}
                  style={[tw`w-1/2 p-2`, { opacity: fadeAnim }]}
                >
                  <View style={tw`bg-white p-3 rounded-lg shadow-lg relative`}>
                    <Image
                      source={{
                        uri:
                          product.images.length > 0
                            ? product.images[0].image
                            : "https://via.placeholder.com/150",
                      }}
                      style={tw`h-44 w-full rounded-lg`}
                    />
                    <Text style={tw`text-lg font-bold mt-2`}>
                      {product.name}
                    </Text>
                    <Text style={tw`text-gray-500 text-sm`}>
                      R{Number(product.price || 0).toFixed(2)}
                    </Text>

                    {/* Sale Badge */}
                    {product.onSale && (
                      <View
                        style={tw`absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full`}
                      >
                        <Text style={tw`text-white text-xs font-semibold`}>
                          -{product.discountPercentage}%
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={tw`flex-row justify-between mt-2`}>
                      <TouchableOpacity
                        style={tw`bg-blue-500 p-2 rounded-lg flex-1 mr-1`}
                      >
                        <Text
                          style={tw`text-white text-center text-sm font-semibold`}
                        >
                          View
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={tw`bg-green-500 p-2 rounded-lg flex-1 ml-1`}
                      >
                        <Ionicons
                          name="cart"
                          size={16}
                          color="white"
                          style={tw`text-center`}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={tw`w-full p-5 flex items-center`}>
                <Ionicons name="sad-outline" size={40} color="gray" />
                <Text style={tw`text-gray-500 mt-2`}>No products found</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;
