import axios from 'axios';
import { API_BASE_URL } from './AuthService';



export const getUserCoupons = async (user_id: number) => {
  const res = await axios.post(`${API_BASE_URL}/reward/coupons/`, {
    user_id
  });
  return res.data;
};

  


