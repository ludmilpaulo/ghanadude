import axios from 'axios';
import { API_BASE_URL } from './AuthService';


const ProductService = {
  async getProducts(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/products/`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/categories/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default ProductService;
