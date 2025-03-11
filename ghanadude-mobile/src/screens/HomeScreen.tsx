import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import ProductService from "../services/ProductService";
import ProductCard from "../components/ProductCard";
import { Product, Category, Size } from "../types";

const categoryIcons: { [key: string]: string } = {
  all: "tags",
  mens: "male",
  woman: "female",
  kids: "child",
};

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Ensure this function exists
    fetchSizes();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedSize) filters.size = selectedSize;
      if (selectedCategory && selectedCategory !== "all") filters.category = selectedCategory.toLowerCase();

      console.log("Fetching products with filters:", filters); // Debugging

      const res = await ProductService.getProducts(filters);
      console.log("Products fetched:", res);
      setProducts(res);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ProductService.getCategories();
      setCategories([{ id: "all", name: "All Products" }, ...data]); // Add "All Products" category
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/product/sizes/`);
      const data = await res.json();
      setSizes(data);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView style={tw`p-4`}>
        {/* Category Section */}
        <Text style={tw`text-2xl font-bold mb-4`}>Categories</Text>
        <View style={tw`flex-row flex-wrap justify-between mb-6`}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                tw`w-[48%] bg-white shadow rounded-xl py-5 items-center mb-4`,
                selectedCategory === cat.name && tw`border-2 border-blue-600`,
              ]}
              onPress={() => {
                setSelectedCategory(cat.name);
                fetchProducts();
              }}
            >
              <FontAwesome5 name={categoryIcons[cat.name.toLowerCase()] || "tag"} size={32} color="#4f46e5" />
              <Text style={tw`capitalize mt-2 text-lg`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* All Products */}
        <Text style={tw`text-2xl font-bold mt-6 mb-4`}>🛍️ All Products</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" />
        ) : (
          <View style={tw`flex-row flex-wrap justify-between`}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
