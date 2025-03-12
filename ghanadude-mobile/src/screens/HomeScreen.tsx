import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import ProductService from "../services/ProductService";
import ProductCard from "../components/ProductCard";
import { Product, Category } from "./types";

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
    filterProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    console.log("Fetching all products...");

    try {
      const res = await ProductService.getProducts();
      console.log("Fetched products:", res);

      setAllProducts(res);
      setFilteredProducts(res); // Ensures "All Products" initially shows everything
      setNotFound(res.length === 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const data = await ProductService.getCategories();
      console.log("Fetched categories:", data);

      setCategories([{ id: "all", name: "All Products" }, ...data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterProducts = () => {
    console.log("Filtering products...");
    console.log("Selected Category:", selectedCategory);
    console.log("Search Query:", searchQuery);

    let updatedProducts = [...allProducts];

    // If "All Products" is selected, reset to allProducts immediately
    if (selectedCategory === "all") {
      console.log("All Products selected. Showing all products.");
      setFilteredProducts(allProducts);
      setNotFound(allProducts.length === 0);
      return;
    }

    // Apply category filter
    updatedProducts = updatedProducts.filter(
      (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
    );

    console.log("Filtered by category:", updatedProducts);

    // Apply search filter
    if (searchQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Filtered by search query:", updatedProducts);
    }

    setFilteredProducts(updatedProducts);
    setNotFound(updatedProducts.length === 0);

    console.log("Final filtered products:", updatedProducts);
  };

  const handleCategorySelect = (category: string) => {
    console.log(`Category selected: ${category}`);

    setSelectedCategory(category);
    setSearchQuery(""); // Reset search when changing category

    // Immediately reset to all products if "All Products" is clicked
    if (category === "all") {
      console.log("Resetting to show all products.");
      setFilteredProducts(allProducts);
      setNotFound(allProducts.length === 0);
    }
  };

  const onSaleProducts = filteredProducts.filter((product) => product.on_sale);
  console.log("On Sale Products:", onSaleProducts);

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8F8F8]`}>
      <ScrollView style={tw`p-4`}>
        {/* Categories */}
        <Text style={tw`text-2xl font-bold text-black mb-4`}>Categories</Text>
        <View style={tw`flex-row flex-wrap justify-between mb-4`}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                tw`w-[48%] bg-white shadow rounded-xl py-5 items-center mb-4`,
                selectedCategory === cat.name && tw`border-2 border-black`,
              ]}
              onPress={() => handleCategorySelect(cat.name)}
            >
              <FontAwesome5 name={categoryIcons[cat.name.toLowerCase()] || "tag"} size={32} color="black" />
              <Text style={tw`capitalize mt-2 text-lg text-black`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar (Moved Below Categories) */}
        <View style={tw`flex-row items-center bg-white rounded-xl p-3 shadow mb-6`}>
          <FontAwesome5 name="search" size={18} color="#333" style={tw`mr-2`} />
          <TextInput
            placeholder="Search for products..."
            style={tw`flex-1 text-base text-black`}
            value={searchQuery}
            onChangeText={(text) => {
              console.log("User typed in search bar:", text);
              setSearchQuery(text);
            }}
          />
        </View>

        {/* Alert if no product is found */}
        {notFound && (
          <View style={tw`bg-red-100 p-4 rounded-lg mb-4`}>
            <Text style={tw`text-red-600 font-semibold text-center`}>⚠️ Product not found!</Text>
          </View>
        )}

        {/* Products Section - Horizontal Scroll */}
        <Text style={tw`text-2xl font-bold text-black mt-6 mb-4`}>🛍️ New Arrivals</Text>
        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-6`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        )}

        {/* Products On Sale - Horizontal Scroll */}
        {onSaleProducts.length > 0 && (
          <>
            <Text style={tw`text-2xl font-bold text-black mt-8 mb-4`}>🔥 On Sale</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {onSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
