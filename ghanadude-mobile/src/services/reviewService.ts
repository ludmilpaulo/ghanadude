// services/reviewService.ts
import axios from "axios";
import { API_BASE_URL } from "./AuthService";

export const fetchProductReviews = async (
  productId: number,
  userId?: number,
) => {
  const url = `${API_BASE_URL}/product/products/${productId}/reviews/`;
  const params = userId ? { user_id: userId } : {};
  const res = await axios.get(url, { params });
  return res.data;
};

export const createReview = async (
  productId: number,
  userId: number,
  rating: number,
  comment: string,
) => {
  const url = `${API_BASE_URL}/product/products/${productId}/review/`;
  const res = await axios.post(url, { user_id: userId, rating, comment });
  return res.data;
};

export const reactToReview = async (
  reviewId: number,
  userId: number,
  action: "like" | "dislike",
) => {
  const url = `${API_BASE_URL}product/reviews/${reviewId}/react/`;
  const res = await axios.post(url, { user_id: userId, action });
  return res.data;
};
