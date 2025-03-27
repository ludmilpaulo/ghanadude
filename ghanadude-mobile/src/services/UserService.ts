

import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export const fetchUserProfile = async (user_id: number) => {
  const response = await axios.get(`${API_BASE_URL}/account/account/profile/${user_id}/`);
  return response.data;
};





interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  // Add other fields as needed
}

export const updateUserProfile = async (user_id: number, profileData: UserProfile) => {
  console.log("update user account")
  const res = await axios.put(`${API_BASE_URL}/account/update/${user_id}/`, profileData);
  return res.data;
};



export const fetchRewards = async (user_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/rewards/status/`, {
    params: { user_id },
  
  });
  return res.data;
};



export const redeemRewards = async (user_id: number) => {
  const res = await axios.post(`${API_BASE_URL}/reward/redeem/`, {
    user_id
  });
  return res.data;
};

