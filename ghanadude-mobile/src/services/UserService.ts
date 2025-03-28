

import axios from 'axios';
import { API_BASE_URL } from './AuthService';
export interface UserProfile {
  user_id: number; // <- this is required
  name: string;
  email: string;
  phone_number?: string;
  address: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface UserProfileResponse {
  user_id: number;
  username: string;
  email: string;
  phone_number?: string;
  address: string;
  city?: string;
  postal_code?: string;
  country?: string;
}
export type ProfileForm = Omit<UserProfile, 'user_id'>;

export const fetchUserProfile = async (user_id: number) => {
  const response = await axios.get(`${API_BASE_URL}/account/account/profile/${user_id}/`);
  return response.data;
};




export const updateUserProfile = async (user_id: number, profileData: ProfileForm) => {
  console.log("update user account");
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
 