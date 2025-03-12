import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../screens/types";

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
  image: string;
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
    // ✅ Fixed: Always increase quantity by 1 instead of replacing the product object
    updateBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize);

      if (index >= 0) {
        state.items[index].quantity += 1; // ✅ Correct increment
      } else {
        state.items.push({ ...action.payload, quantity: 1 } as CartItem);
      }
    },

    decreaseBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize);
      
      if (index >= 0 && state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      } else {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id || item.selectedSize !== action.payload.selectedSize
        );
      }
    },

    removeFromBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload.id || item.selectedSize !== action.payload.selectedSize
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { updateBasket, decreaseBasket, removeFromBasket, clearCart } = basketSlice.actions;
export default basketSlice.reducer;
