import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ✅ Export the CartItem interface
export interface CartItem {
  id: number;
  name: string;
  selectedSize: string;
  quantity: number;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
  isBulk?: boolean;
  brandLogo?: string | null;
  customDesign?: string | null;
}

interface BasketState {
  items: CartItem[];
}

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    updateBasket: (state, action: PayloadAction<CartItem>) => {
      const index = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.isBulk === action.payload.isBulk
      );

      if (index >= 0) {
        if (state.items[index].quantity + action.payload.quantity <= state.items[index].stock) {
          state.items[index].quantity += action.payload.quantity;
        } else {
          state.items[index].quantity = state.items[index].stock;
        }
      } else {
        state.items.push(action.payload);
      }
    },

    decreaseBasket: (
      state,
      action: PayloadAction<{ id: number; selectedSize: string; isBulk?: boolean }>
    ) => {
      const index = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.isBulk === action.payload.isBulk
      );

      if (index >= 0 && state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      } else {
        state.items = state.items.filter(
          (item) =>
            item.id !== action.payload.id ||
            item.selectedSize !== action.payload.selectedSize ||
            item.isBulk !== action.payload.isBulk
        );
      }
    },

    removeFromBasket: (
      state,
      action: PayloadAction<{ id: number; selectedSize: string; isBulk?: boolean }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          item.id !== action.payload.id ||
          item.selectedSize !== action.payload.selectedSize ||
          item.isBulk !== action.payload.isBulk
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.basket.items;

export const { updateBasket, decreaseBasket, removeFromBasket, clearCart } = basketSlice.actions;
export default basketSlice.reducer;
