// redux/slices/productSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "../../services/ProductService";
import { Product, Category } from "../../screens/types";

// Define the state type
interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

// Initial state with proper typing
const initialState: ProductState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const data = await ProductService.getProducts();
    return data;
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async () => {
    const data = await ProductService.getCategories();
    return [{ id: "all", name: "All" }, ...data];
  }
);

// Slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default productSlice.reducer;
