import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../services/AuthService";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { getState }) => {
  const state: any = getState();
  const token = state.auth.user?.token;

  const response = await axios.get(`${API_BASE_URL}/product/wishlist/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});

export const addToWishlist = createAsyncThunk("wishlist/add", async (productId: number, { getState }) => {
  const state: any = getState();
  const token = state.auth.user?.token;

  await axios.post(
    `${API_BASE_URL}/product/wishlist/add/`,
    { product_id: productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return productId;
});

export const removeFromWishlist = createAsyncThunk("/product/wishlist/remove", async (productId: number, { getState }) => {
  const state: any = getState();
  const token = state.auth.user?.token;

  await axios.delete(`${API_BASE_URL}/product/wishlist/remove/${productId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return productId;
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [] as number[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.items = action.payload.map((item: any) => item.product.id);
    });
    builder.addCase(addToWishlist.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.items = state.items.filter(id => id !== action.payload);
    });
  },
});

export default wishlistSlice.reducer;
