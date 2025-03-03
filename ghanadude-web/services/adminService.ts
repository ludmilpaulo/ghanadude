import axios from "axios";
import { store } from "@/redux/store";
import { selectUser } from "@/redux/slices/authSlice";
import { baseAPI } from "@/utils/variables";

const API_URL = baseAPI as string;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const user = selectUser(state);
    const token = user?.token;
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("Axios error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "An error occurred while making the request."
    );
  } else {
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred.");
  }
};

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${baseAPI}/pharmacy/products/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createProduct = async (productData: FormData) => {
  try {
    const response = await axios.post(
      `${baseAPI}/pharmacy/products/create/`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${baseAPI}/pharmacy/categories/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateProduct = async (id: number, productData: FormData) => {
  try {
    const response = await axios.put(
      `${baseAPI}/pharmacy/pharmacy/detail/${id}/`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await axios.delete(`${baseAPI}/pharmacy/pharmacy/detail/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
