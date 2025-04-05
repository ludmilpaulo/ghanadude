// components/ReviewForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';

import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { createReview } from '../services/reviewService';

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const user = useSelector(selectUser);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return Alert.alert('Error', 'User not found.');
    if (rating < 1 || rating > 5) return Alert.alert('Invalid Rating', 'Please rate between 1 and 5');
    if (!comment.trim()) return Alert.alert('Empty Comment', 'Please write your review');

    try {
      setSubmitting(true);
      await createReview(productId, user.user_id, rating, comment);
      Alert.alert('Thank You! 🎉', 'Your review has been submitted.');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch {
      Alert.alert('Error', 'Failed to submit review. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={tw`mt-4 bg-white p-4 rounded-xl shadow`}>
      <Text style={tw`text-lg font-bold mb-2 text-gray-800`}>📝 Leave a Review</Text>

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
        style={tw`border border-gray-300 rounded-lg p-3 text-base bg-gray-50`}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={tw`mt-3 bg-blue-600 py-3 rounded-lg`}
      >
        <Text style={tw`text-white font-bold text-center`}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReviewForm;
