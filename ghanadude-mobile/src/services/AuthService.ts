import axios, { AxiosError } from 'axios';


const API_BASE_URL = "https://www.ghanadude.co.za/account";

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
    }catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || 'Error occurred';
      }
      throw 'An unexpected error occurred';
    }
    
  },

  login: async (username: string, password: string) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login/`, {
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
      await axios.post(`${API_BASE_URL}/password-reset/`, { email });
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
      await axios.post(`${API_BASE_URL}/password-reset/confirm/`, {
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
      const response = await axios.get(`${API_BASE_URL}/account/profile/${userId}/`);
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
      const response = await axios.put(`${API_BASE_URL}/account/update/${userId}/`, data);
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
