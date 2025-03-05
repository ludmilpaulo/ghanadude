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
    const response = await axios.get(`${baseAPI}/product/products/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createProduct = async (productData: FormData) => {
  try {
    const response = await axios.post(
      `${baseAPI}/product/products/create/`,
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
    const response = await axios.get(`${baseAPI}/product/categories/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateProduct = async (id: number, productData: FormData) => {
  try {
    const response = await axios.put(
      `${baseAPI}/product/products/detail/${id}/`,
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
    const response = await axios.delete(`${baseAPI}/product/products/detail/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post("/order/orders/", orderData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${baseAPI}/order/orders/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: number,
  data: { status: string },
) => {
  try {
    await axios.patch(
      `${baseAPI}/order/orders/${orderId}/update-status/`,
      data,
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const fetchSalesSummary = async () => {
  try {
    const response = await axios.get(`${baseAPI}/order/sales-summary/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    return { daily_sales: 0, monthly_sales: 0, yearly_sales: 0 };
  }
};

export const fetchUserStatistics = async () => {
  try {
    const response = await axios.get(`${baseAPI}/order/user-statistics/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchLocationStatistics = async () => {
  try {
    const response = await axios.get(`${baseAPI}/order/location-statistics/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${baseAPI}/account/users/`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
