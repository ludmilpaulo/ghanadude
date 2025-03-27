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

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  status: string;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

export const fetchUserOrders = async (
  user_id: number,
  token: string,
  status: string
): Promise<Order[]> => {
  console.log('📤 Sending request to fetchUserOrders...');
  const res = await axios.post(
    `${API_BASE_URL}/order/orders/user/`,
    { user_id, status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log('✅ Received response from fetchUserOrders:', res.data);
  return res.data.results;
};



export const fetchOrderDetail = async (orderId: number, token: string) => {
  const res = await axios.get(`${API_BASE_URL}/order/orders/${orderId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

