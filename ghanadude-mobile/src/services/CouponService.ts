import axios from 'axios';
import { API_BASE_URL } from './AuthService';

// Define the Coupon type based on what your backend returns
export interface Coupon {
  id: number;
  code: string;
  value: number;
  is_redeemed: boolean;
  expires_at: string; // ISO 8601 date string
}

// Fetch all coupons for a user
export const getUserCoupons = async (user_id: number): Promise<Coupon[]> => {
  const res = await axios.post(`${API_BASE_URL}/reward/coupons/`, { user_id });
  return res.data as Coupon[];
};
