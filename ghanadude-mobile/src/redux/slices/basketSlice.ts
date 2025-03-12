import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
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
    updateBasket: (state, action: PayloadAction<CartItem>) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id && item.selectedSize === product.selectedSize);

      if (index >= 0) {
        state.items[index].quantity += product.quantity;
      } else {
        state.items.push(product);
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
