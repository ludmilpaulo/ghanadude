import axios from "axios";
import { API_BASE_URL } from "./AuthService";

export const deleteUserAccountById = async (userId: number) => {
  const response = await axios.post(`${API_BASE_URL}/account/users/delete/`, {
    user_id: userId,
  });
  return response.data;
};

export const restoreUserAccountById = async (userId: number) => {
  const response = await axios.post(`${API_BASE_URL}/account/users/restore/`, {
    user_id: userId,
  });
  return response.data;
};
