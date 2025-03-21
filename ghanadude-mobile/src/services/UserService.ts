

import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export const fetchUserProfile = async (user_id: number) => {
  const response = await axios.get(`${API_BASE_URL}/account/account/profile/${user_id}/`);
  return response.data;
};





export const updateUserProfile = async (user_id: number, profileData: any) => {
  console.log("update user account")
  const res = await axios.put(`${API_BASE_URL}/account/update/${user_id}/`, profileData);
  return res.data;
};
