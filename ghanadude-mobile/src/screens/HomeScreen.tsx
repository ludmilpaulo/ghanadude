import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import axios from "axios";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Animatable from "react-native-animatable";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import ProductCard from "../components/ProductCard";
import CreateProfileModal from "../components/CreateProfileModal";
import { fetchUserProfile, ProfileForm, updateUserProfile} from "../services/UserService";
import { selectUser } from "../redux/slices/authSlice";
import { fetchProducts, fetchCategories } from "../redux/slices/productSlice";
import { RootState, AppDispatch } from "../redux/store";


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
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const { products, categories, loading } = useSelector((state: RootState) => state.products);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();
    const genderMatch =
      selectedGender === "all" ||
      product.gender?.toLowerCase() === selectedGender.toLowerCase();
    const queryMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && genderMatch && queryMatch;
  });

  const onSaleProducts = products.filter((p) => p.on_sale);
  const promoBanners = onSaleProducts.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: `Save ${product.discount_percentage}%`,
    image: product.images?.[0]?.image || "https://via.placeholder.com/400x150",
  }));

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProducts());
      dispatch(fetchCategories());

      if (user) getProfile();

     
    }, [dispatch, user])
  );

  useFocusEffect(
    useCallback(() => {
      setNotFound(filteredProducts.length === 0);
    }, [filteredProducts])
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promo Carousel */}
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
                  contentFit="cover"
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
        <View style={tw`flex-row items-center bg-gray-100 rounded-full px-4 py-3 mx-4 mt-6`}>
          <FontAwesome5 name="search" size={16} color="#666" style={tw`mr-3`} />
          <TextInput
            placeholder="Search for products..."
            style={tw`flex-1 text-base text-black`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {!user && (
          <Animatable.View animation="fadeInDown" delay={300}>
            <LinearGradient
              colors={["#0c0b0b", "#050505", "#030303"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={tw`mx-4 mt-4 p-4 rounded-xl`}
            >
              <Text style={tw`text-white text-center font-semibold text-sm`}>
                You’re browsing as a guest.{"\n"}Login for personalized offers, faster checkout, and rewards.
              </Text>
            </LinearGradient>
          </Animatable.View>
        )}

        {/* Category Filter */}
        <Text style={tw`text-xl font-bold text-gray-800 mt-6 mx-4`}>Browse Categories</Text>
        <ScrollView horizontal contentContainerStyle={tw`pl-4 pr-2 pb-2`} showsHorizontalScrollIndicator={false}>
          {categories.map((cat, index) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <Animatable.View key={cat.id} animation="fadeInRight" delay={index * 100}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory(cat.name)}
                  style={[
                    tw`px-4 py-2 rounded-full mr-3 border`,
                    isSelected
                      ? { backgroundColor: "#0d0b01", borderColor: "#060606" }
                      : tw`bg-white border-gray-300`,
                  ]}
                >
                  <Text style={tw`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-800"}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </ScrollView>

        {/* Gender Filter */}
        <Text style={tw`text-xl font-bold text-gray-800 mt-6 mx-4`}>Shop by Gender</Text>
        <ScrollView horizontal contentContainerStyle={tw`pl-4 pr-2 pb-2`} showsHorizontalScrollIndicator={false}>
          {["All", "Male", "Female", "Unisex"].map((gender, index) => {
            const isSelected = selectedGender.toLowerCase() === gender.toLowerCase();
            return (
              <Animatable.View key={gender} animation="fadeInRight" delay={index * 100}>
                <TouchableOpacity
                  onPress={() => setSelectedGender(gender)}
                  style={[
                    tw`px-4 py-2 rounded-full mr-3 border`,
                    isSelected
                      ? { backgroundColor: "#060606", borderColor: "#070707" }
                      : tw`bg-white border-gray-300`,
                  ]}
                >
                  <Text style={tw`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-800"}`}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </ScrollView>

        {/* Product Section */}
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

      <CreateProfileModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSaveProfile} />
    </SafeAreaView>
  );
};

export default HomeScreen;
