import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Heart, Filter } from "lucide-react-native";
import tw from "twrnc";

// Sample Product Data
const categories = ["All", "Men", "Women", "Kids", "Sale"];
const products = [
  {
    id: "1",
    name: "Designer Jacket",
    image: "https://via.placeholder.com/150",
    price: 120,
    discount: 20,
    stock: 5,
    brand: "Gucci",
    category: "Men",
  },
  {
    id: "2",
    name: "Summer Dress",
    image: "https://via.placeholder.com/150",
    price: 90,
    discount: 0,
    stock: 0,
    brand: "Zara",
    category: "Women",
  },
];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigation = useNavigation();

  // Filter Products Based on Selected Category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      {/* Category Filters */}
      <View style={tw`flex-row justify-between mb-4`}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={tw`px-4 py-2 rounded-full ${selectedCategory === cat ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text style={tw`${selectedCategory === cat ? "text-white" : "text-black"}`}>{cat}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={tw`p-2`}>
          <Filter size={24} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <ScrollView>
        {filteredProducts.map((item) => (
          <View key={item.id} style={tw`bg-white p-4 mb-4 rounded-lg shadow`}>
            <Image source={{ uri: item.image }} style={tw`w-full h-40 rounded`} />
            <Text style={tw`text-lg font-bold mt-2`}>{item.name}</Text>
            <Text style={tw`text-gray-500`}>{item.brand}</Text>
            <Text style={tw`text-lg text-blue-500`}>${item.price}</Text>
            {item.discount > 0 && (
              <Text style={tw`text-red-500`}>-{item.discount}% Off</Text>
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
  );
};

export default HomeScreen;
