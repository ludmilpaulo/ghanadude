import axios from "axios";
import { API_BASE_URL } from "./AuthService";

const ProductService = {
  async getProducts(filters = {}) {
    try {
      console.log("Fetching products with filters:", filters);
      const response = await axios.get(`${API_BASE_URL}/product/products/`, {
        params: filters,
      });

      console.log("API Response:", response.data);
      return response.data.products || response.data; // Adjust based on API response structure
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  async getCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/categories/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};

export default ProductService;
