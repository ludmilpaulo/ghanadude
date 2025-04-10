import React, { useState,  useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import ProductService from "../services/ProductService";
import ProductCard from "../components/ProductCard";
import { Product, Category } from "./types";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/HomeNavigator";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }: { navigation: NavigationProp<HomeStackParamList> }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          const [productsRes, categoriesRes] = await Promise.all([
            ProductService.getProducts(),
            ProductService.getCategories(),
          ]);

          if (isActive) {
            setAllProducts(productsRes);
            setCategories([{ id: "all", name: "All" }, ...categoriesRes]);

            const updated = filterProducts(selectedCategory, searchQuery, productsRes);
            setFilteredProducts(updated);
            setNotFound(updated.length === 0);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 5000);

      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }, [selectedCategory, searchQuery])
  );

  const filterProducts = (
    category = selectedCategory,
    query = searchQuery,
    products = allProducts
  ) => {
    let updated = [...products];

    if (category.toLowerCase() !== "all") {
      updated = updated.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (query) {
      updated = updated.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    return updated;
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    const updated = filterProducts(category, "", allProducts);
    setFilteredProducts(updated);
    setNotFound(updated.length === 0);
  };

  const onSaleProducts = filteredProducts.filter((product) => product.on_sale);

  const promoBanners = onSaleProducts.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: `Save ${product.discount_percentage}%`,
    image: product.images?.[0]?.image || "https://via.placeholder.com/400x150",
  }));

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner Carousel */}
        {promoBanners.length > 0 && (
          <Carousel
            loop
            width={width}
            height={150}
            autoPlay
            autoPlayInterval={4000}
            data={promoBanners}
            scrollAnimationDuration={1000}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
                style={tw`relative rounded-xl overflow-hidden mx-4 mt-4`}
              >
                <Image source={{ uri: item.image }} style={tw`w-full h-40 rounded-xl`} />
                <View style={tw`absolute inset-0 bg-black bg-opacity-30 justify-center px-4`}>
                  <Text style={tw`text-white text-lg font-bold`}>{item.name}</Text>
                  <Text style={tw`text-white text-sm`}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Search Bar */}
        <View style={tw`flex-row items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm mx-4 mt-6`}>
          <FontAwesome5 name="search" size={16} color="#666" style={tw`mr-3`} />
          <TextInput
            placeholder="Search for products..."
            placeholderTextColor="#888"
            style={tw`flex-1 text-base text-black`}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {/* Categories */}
        <Text style={tw`text-xl font-bold text-gray-800 mt-6 mx-4`}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pl-4 pt-3 mb-2`}>
          {categories.map((cat, index) => (
            <Animated.View key={cat.id} entering={FadeInRight.delay(index * 100)}>
              <TouchableOpacity
                onPress={() => handleCategorySelect(cat.name)}
                style={[
                  tw`px-4 py-2 mr-3 rounded-full border`,
                  selectedCategory === cat.name
                    ? tw`bg-blue-600 border-blue-600`
                    : tw`bg-white border-gray-300`,
                ]}
              >
                <Text
                  style={tw`${selectedCategory === cat.name ? "text-white" : "text-gray-800"}`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Product Grid */}
        <View style={tw`px-4`}>
          {notFound && (
            <View style={tw`bg-red-100 p-4 rounded-lg mb-4`}>
              <Text style={tw`text-red-600 font-semibold text-center`}>⚠️ No products found</Text>
            </View>
          )}

          <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>🛍️ New Arrivals</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredProducts.map((product, i) => (
                <Animated.View key={product.id} entering={FadeInUp.delay(i * 100)}>
                  <ProductCard product={product} />
                </Animated.View>
              ))}
            </ScrollView>
          )}

          {onSaleProducts.length > 0 && (
            <>
              <Text style={tw`text-xl font-bold text-gray-800 mt-6 mb-4`}>🔥 On Sale</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {onSaleProducts.map((product, i) => (
                  <Animated.View key={product.id} entering={FadeInUp.delay(i * 100)}>
                    <ProductCard product={product} />
                  </Animated.View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
