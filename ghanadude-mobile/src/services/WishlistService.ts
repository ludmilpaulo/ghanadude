// WishlistService.ts

import axios from "axios";
import { API_BASE_URL } from "./AuthService";

export const getWishlist = async (userId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/wishlist/?user_id=${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

export const addToWishlist = async (userId: number, productId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/wishlist/add/`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: productId })
    });

    return response.ok;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }
};

export const removeFromWishlist = async (userId: number, productId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/wishlist/remove/${productId}/?user_id=${userId}`, {
      method: "DELETE"
    });

    return response.ok;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }
};

export const fetchWishlistCount = async (userId: number): Promise<number> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product/wishlist/count/`, {
      params: { user_id: userId },
    });
    return response.data.count ?? 0;
  } catch (error) {
    console.error("❌ Failed to fetch wishlist count:", error);
    return 0;
  }
};

