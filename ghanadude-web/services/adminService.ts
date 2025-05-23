import axios from "axios";
import { store } from "@/redux/store";
import { selectUser } from "@/redux/slices/authSlice";
import { baseAPI } from "@/utils/variables";

const API_URL = baseAPI as string;
interface OrderData {
  // Define the structure of orderData here
  productId: number;
  quantity: number;
  // Add other fields as needed
}

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
  },
);

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("Axios error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        "An error occurred while making the request.",
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
      },
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
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await axios.delete(
      `${baseAPI}/product/products/detail/${id}/`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await api.post("/order/orders/", orderData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchOrders = async () => {
  try {
    const response = await fetch(`${baseAPI}/order/orders/`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return await response.json();
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

export const updateBulkOrderStatus = async (
  orderId: number,
  data: { status: string },
) => {
  try {
    await axios.patch(
      `${baseAPI}/order/bulk-orders/${orderId}/update-status/`,
      data,
    );
  } catch (error) {
    console.error("Error updating bulk order status:", error);
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

export const fetchLocationStatistics = async (
  region: "country" | "city" = "country",
): Promise<{
  points: { name: string; lat: number; lng: number; total_sales: number }[];
  thresholds: { min: number; max: number; color: string }[];
}> => {
  try {
    const response = await axios.get(`${baseAPI}/order/location-statistics/`, {
      params: { region },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching location statistics:", error);
    return { points: [], thresholds: [] };
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

interface Size {
  id: number;
  name: string;
  // Add other fields as needed
}

export const fetchSizes = async (): Promise<Size[]> => {
  const res = await fetch(`${baseAPI}/product/sizes/`);
  if (!res.ok) throw new Error("Failed to fetch sizes");
  return res.json();
};

export const fetchBulkOrders = async () => {
  const res = await axios.get(`${baseAPI}/order/admin/bulk-orders/`);
  return res.data;
};

export const fetchSalesInRange = async (start: Date, end: Date) => {
  const res = await axios.get(`${baseAPI}/reward/sales_range`, {
    params: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
  return res.data;
};

export const fetchTopProductsPerMonth = async (
  start: Date,
  end: Date,
  status: string = "All",
  category?: string,
) => {
  const res = await axios.get(`${baseAPI}/reward/top_products_by_month/`, {
    params: {
      start: start.toISOString(),
      end: end.toISOString(),
      ...(status !== "All" && { status }),
      ...(category && { category }),
    },
  });
  return res.data;
};

export const fetchTopUsers = async () => {
  const res = await axios.get(`${baseAPI}/reward/user/top-spenders/`);
  return res.data;
};

export const fetchCitySalesByProduct = async (productId: number) => {
  const res = await axios.get(`${baseAPI}/reward/city-sales-by-product/`, {
    params: { product: productId },
  });
  return res.data;
};
