import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import tw from "twrnc";
import { MotiView } from "moti";
import HeroCarousel from "../components/HeroCarousel";

import ProductService from "../services/ProductService";
import { Product, Category } from "./types";
import ProductCard from "../components/ProductCard";

const { width } = Dimensions.get("window");

const categoryIcons: { [key: string]: string } = {
  all: "tags",
  mens: "male",
  woman: "female",
  kids: "child",
};

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      filterProducts(selectedCategory, searchQuery);
    }
  }, [searchQuery, selectedCategory, allProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts();
      setAllProducts(res);
      setFilteredProducts(res);
      setNotFound(res.length === 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ProductService.getCategories();
      setCategories([{ id: "all", name: "All" }, ...data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterProducts = (category = selectedCategory, query = searchQuery) => {
    let updatedProducts = [...allProducts];
    if (category.toLowerCase() !== "all") {
      updatedProducts = updatedProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (query) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredProducts(updatedProducts);
    setNotFound(updatedProducts.length === 0);
  };

  const onSaleProducts = filteredProducts.filter((product) => product.on_sale);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`p-4`} showsVerticalScrollIndicator={false}>
        <HeroCarousel />

        <Text style={tw`text-xl font-bold mt-4 mb-2`}>Categories</Text>
        <View style={tw`flex-row flex-wrap justify-between mb-4`}>
          {categories.map((cat, index) => (
            <MotiView
              key={cat.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 60 }}
              style={tw`w-[48%] mb-3`}
            >
              <View
                style={[
                  tw`bg-white p-4 rounded-xl items-center shadow`,
                  selectedCategory === cat.name && tw`border-2 border-blue-600`,
                ]}
              >
                <FontAwesome5
                  name={categoryIcons[cat.name.toLowerCase()] || "tag"}
                  size={24}
                  color="black"
                />
                <Text
                  style={tw`capitalize mt-2 text-black font-semibold`}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    setSearchQuery("");
                  }}
                >
                  {cat.name}
                </Text>
              </View>
            </MotiView>
          ))}
        </View>

        <View style={tw`flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-6`}>
          <FontAwesome5 name="search" size={16} color="#666" style={tw`mr-3`} />
          <TextInput
            placeholder="Search for products..."
            placeholderTextColor="#888"
            style={tw`flex-1 text-base text-black`}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {notFound && (
          <View style={tw`bg-red-100 p-4 rounded-lg mb-4`}>
            <Text style={tw`text-red-600 font-semibold text-center`}>
              ⚠️ No products found
            </Text>
          </View>
        )}

        <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>🛍️ Products</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </ScrollView>
        )}

        {onSaleProducts.length > 0 && (
          <>
            <Text style={tw`text-xl font-bold text-gray-800 mt-6 mb-4`}>🔥 On Sale</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {onSaleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
