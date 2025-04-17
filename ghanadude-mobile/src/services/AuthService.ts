import axios, { AxiosError } from 'axios';

//import { BASE_API_DEV, BASE_API_PROD, APP_ENV } from '@env'

//export const API_BASE_URL = APP_ENV === 'prod' ? BASE_API_PROD : BASE_API_DEV

//const devAPI = 'http://192.168.1.109:8000';
const devAPI = 'https://www.ghanadude.co.za';
const prodAPI = 'https://www.ghanadude.co.za';

const isProd = !__DEV__;

export const API_BASE_URL = isProd ? prodAPI : devAPI;

//export const API_BASE_URL = 'https://www.ghanadude.co.za';

interface ResetPasswordResponse {
  message: string;
  username: string;
  uid: string;
  token: string;
}


interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

const AuthService = {
  signup: async (username: string, email: string, password: string) => {
    console.log("signup clicked")
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
    console.log("login clicked");
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/account/login/`, {
        username,
        password,
      });
  
      console.log("API response:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Login error response:", error.response?.data);
        throw error.response?.data || { error: 'Error occurred' };
      }
      throw { error: 'An unexpected error occurred' };
    }
  },
  

  logout: async () => {
    
  },

  resetPassword: async (email: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await axios.post<ResetPasswordResponse>(
        `${API_BASE_URL}/account/password-reset/`,
        { email }
      );
      return response.data;
    } catch (error: unknown) {
      if (
        error instanceof AxiosError &&
        error.response?.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
      ) {
        throw error.response.data as { error: string };
      }
      throw { error: "An unexpected error occurred." };
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
