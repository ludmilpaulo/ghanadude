import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import tw from "twrnc";
import { FontAwesome } from "@expo/vector-icons";
import { API_BASE_URL } from "../services/AuthService";

type ScreenRouteProp = RouteProp<HomeStackParamList, "FullReview">;

const FullReviewScreen = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [reviews, setReviews] = useState([]);
  const [stars, setStars] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const url = `${API_BASE_URL}/product/products/${id}/reviews/?page=${page}${stars ? `&stars=${stars}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      setReviews(data.results || data); // support both paginated and unpaginated
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [stars, page]);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>All Reviews</Text>

        {/* Filters */}
        <View style={tw`flex-row mb-4`}>
          {[5, 4, 3, 2, 1].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStars(stars === s ? null : s)}
              style={tw`mr-2 px-3 py-1 rounded-full border ${stars === s ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
            >
              <Text style={tw`${stars === s ? "text-white" : "text-gray-800"}`}>
                {s}★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviews List */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : reviews.length === 0 ? (
          <Text>No reviews yet.</Text>
        ) : (
          reviews.map((review: any) => (
            <View key={review.id} style={tw`mb-4 p-3 bg-gray-100 rounded-lg`}>
              <View style={tw`flex-row mb-1`}>
                {[...Array(5)].map((_, i) => (
                  <FontAwesome
                    key={i}
                    name={i < review.rating ? "star" : "star-o"}
                    size={16}
                    color="#fbbf24"
                  />
                ))}
              </View>
              <Text style={tw`font-bold text-gray-700`}>{review.user}</Text>
              <Text style={tw`text-sm text-gray-600`}>{review.comment}</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>{review.date}</Text>
            </View>
          ))
        )}

        {/* Pagination */}
        <View style={tw`flex-row justify-between mt-4`}>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={tw`px-4 py-2 bg-gray-200 rounded ${page === 1 ? "opacity-50" : ""}`}
          >
            <Text>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPage((p) => p + 1)}
            style={tw`px-4 py-2 bg-gray-200 rounded`}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FullReviewScreen;
