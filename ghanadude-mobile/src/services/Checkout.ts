import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export interface CheckoutItem {
  id: number;
  quantity: number;
  is_bulk?: boolean;
  size?: string;
}

export interface CheckoutData {
  user_id: number;
  total_price: number;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  payment_method: string;
  status: string;
  items: CheckoutItem[];
  coupon_code?: string;
}

export type CheckoutPayload = CheckoutData | FormData;

export const checkoutOrder = async (data: CheckoutPayload) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const config = {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  };

  const response = await axios.post(`${API_BASE_URL}/order/checkout/`, data, config);
  return response.data; // { order_id: number }
};
