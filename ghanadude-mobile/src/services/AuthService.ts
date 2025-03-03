import axios, { AxiosError } from 'axios';


export const API_BASE_URL = "http://127.0.0.1:8000";

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
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/account/signup/`, {
        username,
        email,
        password,
      });
     
      return response.data;
    }catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  login: async (username: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/account/login/`, {
        username,
        password,
      });
    
    }catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  logout: async () => {
    
  },

  resetPassword: async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/account/password-reset/`, { email });
      return { message: 'Password reset email sent' };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  resetPasswordConfirm: async (uid: string, token: string, newPassword: string) => {
    try {
      await axios.post(`${API_BASE_URL}/account/password-reset/confirm/`, {
        uid,
        token,
        newPassword,
      });
      return { message: 'Password has been reset' };
    }catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  getUserProfile: async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/account/account/profile/${userId}/`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  updateUserProfile: async (userId: number, data: object) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/account/account/update/${userId}/`, data);
      return response.data;
    }catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },
};

export default AuthService;
