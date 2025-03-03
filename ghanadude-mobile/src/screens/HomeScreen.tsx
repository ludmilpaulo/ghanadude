import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Heart, Filter } from "lucide-react-native";
import tw from "twrnc";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../services/AuthService";

const API_URL = API_BASE_URL; // Replace with your API base URL

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoryRes, brandRes, productRes] = await Promise.all([
        axios.get(`${API_URL}/categories/`),
        axios.get(`${API_URL}/brands/`),
        axios.get(`${API_URL}/products/`),
      ]);
      
      setCategories(["All", ...categoryRes.data]);
      setBrands(brandRes.data);
      setProducts(productRes.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category.name === selectedCategory);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <View style={tw`p-4`}>
          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(cat)}
                style={tw`px-4 py-2 mx-2 rounded-full ${selectedCategory === cat ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <Text style={tw`${selectedCategory === cat ? "text-white" : "text-black"}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Product List */}
          <ScrollView>
            {filteredProducts.map((item) => (
              <View key={item.id} style={tw`bg-white p-4 mb-4 rounded-lg shadow`}>                
                <Image source={{ uri: `${API_URL}${item.images[0]?.image}` }} style={tw`w-full h-40 rounded`} />
                <Text style={tw`text-lg font-bold mt-2`}>{item.name}</Text>
                <Text style={tw`text-gray-500`}>{item.brand.name}</Text>
                <Text style={tw`text-lg text-blue-500`}>${item.price}</Text>
                {item.discount_percentage > 0 && (
                  <Text style={tw`text-red-500`}>-{item.discount_percentage}% Off</Text>
                )}
                <Text style={tw`mt-1 ${item.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                  {item.stock > 0 ? `In Stock (${item.stock})` : "Out of Stock"}
                </Text>

                {/* Wishlist Button */}
                <TouchableOpacity
                  onPress={() => toggleWishlist(item.id)}
                  style={tw`absolute top-2 right-2 p-2 bg-white rounded-full shadow`}
                >
                  <Heart size={24} stroke={wishlist.includes(item.id) ? "red" : "black"} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;