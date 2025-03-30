import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  count: number;
}

const initialState: WishlistState = {
  count: 0,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistCount(state, action: PayloadAction<number>) {
      state.count = action.payload;
    },
  },
});

export const { setWishlistCount } = wishlistSlice.actions;
export default wishlistSlice.reducer;
