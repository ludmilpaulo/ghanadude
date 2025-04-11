// components/ReviewForm.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';
import { createReview, fetchProductReviews } from '../services/reviewService';

interface Review {
  id: number;
  user: { username: string };
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewFormProps {
  productId: number;
  userId: number;
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchProductReviews(productId);
        setReviews(data);
      } catch {
        Alert.alert('Error', 'Failed to load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (!userId) return Alert.alert('Error', 'User not found.');
    if (rating < 1 || rating > 5) return Alert.alert('Invalid Rating', 'Please rate between 1 and 5');
    if (!comment.trim()) return Alert.alert('Empty Comment', 'Please write your review');

    try {
      setSubmitting(true);
      await createReview(productId, userId, rating, comment);
      Alert.alert('Thank You!', 'Your review has been submitted.');
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>📝 Leave a Review</Text>

      <View style={tw`flex-row mb-3`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)} style={tw`mr-1`}>
            <FontAwesome
              name={i <= rating ? 'star' : 'star-o'}
              size={24}
              color={i <= rating ? '#facc15' : '#d1d5db'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Write your feedback..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        style={tw`border border-gray-300 rounded-lg p-3 text-base bg-white mb-4`}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={tw`bg-blue-600 py-3 rounded-lg mb-6`}
      >
        <Text style={tw`text-white font-bold text-center`}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>

      <Text style={tw`text-lg font-semibold text-gray-700 mb-2`}>⭐ Previous Reviews</Text>

      {loadingReviews ? (
        <ActivityIndicator color="#3B82F6" />
      ) : (
        <ScrollView style={tw`max-h-60`}>
          {reviews.map((rev) => (
            <View key={rev.id} style={tw`mb-4 border-b border-gray-200 pb-2`}>
              <Text style={tw`font-bold text-gray-800`}>{rev.user.username}</Text>
              <Text style={tw`text-yellow-500`}>
                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
              </Text>
              <Text style={tw`text-gray-700`}>{rev.comment}</Text>
              <Text style={tw`text-xs text-gray-400`}>
                {new Date(rev.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ReviewForm;
