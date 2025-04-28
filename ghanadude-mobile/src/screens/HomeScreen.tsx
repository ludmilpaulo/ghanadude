import React, { useState, useCallback } from "react";
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
  Alert,
} from "react-native";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp } from "react-native-reanimated";
import axios from "axios";
import { useSelector } from "react-redux";
import { useFocusEffect, NavigationProp } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import ProductService from "../services/ProductService";
import ProductCard from "../components/ProductCard";
import CreateProfileModal from "../components/CreateProfileModal";
import { fetchUserProfile, ProfileForm, updateUserProfile } from "../services/UserService";
import { LinearGradient } from "expo-linear-gradient";

import { Product, Category } from "./types";
import { selectUser } from "../redux/slices/authSlice";
import { HomeStackParamList } from "../navigation/HomeNavigator";

const { width } = Dimensions.get("window");

export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

const HomeScreen = ({ navigation }: { navigation: NavigationProp<HomeStackParamList> }) => {
  const user = useSelector(selectUser);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const user_id = user?.user_id ?? null;

  const getProfile = async () => {
    if (!user) return;
    try {
      const profileData = await fetchUserProfile(user?.user_id ?? null);
      if (!profileData.profile || Object.keys(profileData.profile).length === 0) {
        setShowModal(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        setShowModal(true);
      }
    }
  };

  const handleSaveProfile = async (form: ProfileData) => {
    if (!user_id) {
      Alert.alert("Error", "User ID is missing. Please login again.");
      return;
    }
    try {
      const payload: ProfileForm = {
        name: `${form.first_name} ${form.last_name}`.trim(),
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        country: form.country,
      };

      await updateUserProfile(user_id, payload);
      setShowModal(false);
      Alert.alert("Success", "Profile updated.");
    } catch  {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

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
            const updated = filterProducts(selectedCategory, searchQuery, productsRes, selectedGender);
            setFilteredProducts(updated);
            setNotFound(updated.length === 0);
          }
          if (user) {
            await getProfile();
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
    }, [selectedCategory, selectedGender, searchQuery]),
  );

  const filterProducts = (
    category = selectedCategory,
    query = searchQuery,
    products = allProducts,
    gender = selectedGender,
  ) => {
    let updated = [...products];

    if (category !== "all") {
      updated = updated.filter(
        (product) => product.category?.toLowerCase() === category.toLowerCase(),
      );
    }

    if (gender !== "all") {
      updated = updated.filter(
        (product) => product.gender?.toLowerCase() === gender.toLowerCase(),
      );
    }

    if (query) {
      updated = updated.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      );
    }

    return updated;
  };

  const handleCategorySelect = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    setSelectedCategory(normalizedCategory);
    const updated = filterProducts(normalizedCategory, searchQuery, allProducts, selectedGender);
    setFilteredProducts(updated);
    setNotFound(updated.length === 0);
  };

  const handleGenderSelect = (gender: string) => {
    const normalizedGender = gender.toLowerCase();
    setSelectedGender(normalizedGender);
    const updated = filterProducts(selectedCategory, searchQuery, allProducts, normalizedGender);
    setFilteredProducts(updated);
    setNotFound(updated.length === 0);
  };

  const onSaleProducts = allProducts.filter((product) => product.on_sale);

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
                <Image
                  source={{ uri: item.image }}
                  style={tw`w-full h-40 rounded-xl`}
                />
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

        {/* Guest Notice */}
        {!user && (
          <Animatable.View animation="fadeInDown" delay={300}>
            <LinearGradient
              colors={["#ce1126", "#fcd116", "#007940"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={tw`mx-4 mt-4 p-4 rounded-xl shadow-md`}
            >
              <Text style={tw`text-white text-center font-semibold text-sm`}>
                You’re browsing as a guest.{"\n"}Login for personalized offers, faster checkout, and rewards.
              </Text>
            </LinearGradient>
          </Animatable.View>
        )}

        {/* Categories */}
        <Text style={tw`text-xl font-bold text-gray-800 mt-6 mx-4`}>
          Browse Categories
        </Text>
        <View style={tw`mt-4`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`pl-4 pr-2 pb-2`}
          >
            {categories.map((cat, index) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <Animatable.View
                  key={`${cat.id}-${cat.name}`}
                  animation="fadeInRight"
                  delay={index * 100}
                  useNativeDriver
                  style={tw`mr-3`}
                >
                  <TouchableOpacity
                    onPress={() => handleCategorySelect(cat.name)}
                    activeOpacity={0.8}
                    style={[
                      tw`px-4 py-2 rounded-full shadow-sm border`,
                      isSelected
                        ? { backgroundColor: "#fcd116", borderColor: "#fcd116" }
                        : tw`bg-white border-gray-300`,
                    ]}
                  >
                    <Text style={[
                      tw`text-sm font-semibold`,
                      isSelected ? { color: "#000" } : tw`text-gray-800`,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </ScrollView>
        </View>

        {/* Gender Filter */}
        <Text style={tw`text-xl font-bold text-gray-800 mt-6 mx-4`}>
          Shop by Gender
        </Text>
        <View style={tw`mt-4`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`pl-4 pr-2 pb-2`}
          >
            {["All", "Male", "Female", "Unisex"].map((gender, index) => {
              const isSelected = selectedGender.toLowerCase() === gender.toLowerCase();
              return (
                <Animatable.View
                  key={gender}
                  animation="fadeInRight"
                  delay={index * 100}
                  useNativeDriver
                  style={tw`mr-3`}
                >
                  <TouchableOpacity
                    onPress={() => handleGenderSelect(gender)}
                    activeOpacity={0.8}
                    style={[
                      tw`px-4 py-2 rounded-full shadow-sm border`,
                      isSelected
                        ? { backgroundColor: "#007940", borderColor: "#007940" }
                        : tw`bg-white border-gray-300`,
                    ]}
                  >
                    <Text style={[
                      tw`text-sm font-semibold`,
                      isSelected ? { color: "#fff" } : tw`text-gray-800`,
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View style={tw`px-4`}>
          {notFound && (
            <View style={tw`bg-red-100 p-4 rounded-lg mb-4`}>
              <Text style={tw`text-red-600 font-semibold text-center`}>
                ⚠️ No products found
              </Text>
            </View>
          )}

          <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
            🛍️ New Arrivals
          </Text>

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
              <Text style={tw`text-xl font-bold text-gray-800 mt-6 mb-4`}>
                🔥 On Sale
              </Text>
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

      {/* Profile creation modal */}
      <CreateProfileModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProfile}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
