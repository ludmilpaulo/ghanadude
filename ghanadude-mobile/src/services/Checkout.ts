import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export interface CheckoutData {
  user_id: number;
  total_price: number;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  payment_method: string;
  status: string;
  items: Array<{ id: number; quantity: number }>;
}

export const checkoutOrder = async (data: CheckoutData) => {
  const response = await axios.post(`${API_BASE_URL}/order/checkout/`, data);
  return response.data; // { order_id: number }
};
