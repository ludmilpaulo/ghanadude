import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export const fetchUserOrders = async (user_id: number, token: string, status: string) => {
    const res = await axios.post(`${API_BASE_URL}/order/orders/user/`, {
      user_id,
      status,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };
  