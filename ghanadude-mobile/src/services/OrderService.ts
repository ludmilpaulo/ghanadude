// services/OrderService.ts
import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export interface ProductImage {
  image: string;
}

export interface Product {
  id: number;
  name: string;
  images: ProductImage[];
}

export interface Order {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  type: 'regular' | 'bulk';
  items: OrderItem[];
  coupon_code?: string;
  reward_points_earned?: number;
  bulk_file?: string;
  invoice?: string;
  is_bulk?: boolean; // optional since you use `type`
}
export interface Order {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  type: 'regular' | 'bulk';
  items: OrderItem[];
  coupon_code?: string;
  reward_points_earned?: number;
  bulk_file?: string;
  invoice?: string;
}

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    images: { image: string }[];
    designer?: { name: string };
  };
  quantity: number;
  price: string;
}

export interface PaginatedOrderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export const fetchUserOrders = async (
  user_id: number,
  token: string,
  status: string
): Promise<PaginatedOrderResponse> => {
  const res = await axios.post(
    `${API_BASE_URL}/order/orders/user/`,
    { user_id, status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log('✅ Orders full response:', res.data);
  return res.data;
};


export const fetchOrderDetail = async (orderId: number, token: string) => {
  const res = await axios.get(`${API_BASE_URL}/order/orders/${orderId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

