import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Product } from "../../screens/types";

interface BasketState {
  items: (Product & { quantity: number })[];
}

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    updateBasket: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id);

      if (index >= 0) {
        state.items[index].quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    decreaseBasket: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const index = state.items.findIndex((item) => item.id === productId);

      if (index >= 0 && state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
      }
    },
    removeFromBasket: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { updateBasket, decreaseBasket, removeFromBasket, clearCart } = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;
export default basketSlice.reducer;
