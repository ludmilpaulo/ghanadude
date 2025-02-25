import axios from 'axios';


const API_BASE_URL = 'https://www.ghanadude.co.za/';

interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

const AuthService = {
  signup: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/signup/`, {
        username,
        email,
        password,
      });
     
      return response.data;
    } catch (error: unknown) {
      throw error.response?.data || 'Signup failed';
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login/`, {
        username,
        password,
      });
    
    } catch (error: unknown) {
      throw error.response?.data || 'Login failed';
    }
  },

  logout: async () => {
    
  },

  resetPassword: async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/password-reset/`, { email });
      return { message: 'Password reset email sent' };
    } catch (error) {
      throw error.response?.data || 'Password reset failed';
    }
  },

  resetPasswordConfirm: async (uid: string, token: string, newPassword: string) => {
    try {
      await axios.post(`${API_BASE_URL}/password-reset/confirm/`, {
        uid,
        token,
        newPassword,
      });
      return { message: 'Password has been reset' };
    } catch (error) {
      throw error.response?.data || 'Password reset confirmation failed';
    }
  },

  getUserProfile: async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/account/profile/${userId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch user profile';
    }
  },

  updateUserProfile: async (userId: number, data: object) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/account/update/${userId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update user profile';
    }
  },
};

export default AuthService;
