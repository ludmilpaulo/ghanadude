import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store"; // ✅ Import RootState

interface CartItem {
  id: number;
  name: string;  // ✅ Add this property
  selectedSize: string;
  quantity: number;
  image: string;
  price: number;
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
    updateBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize);

      if (index >= 0) {
        state.items[index].quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 } as CartItem);
      }
    },

    decreaseBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize);

      if (index >= 0 && state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      } else {
        state.items = state.items.filter((item) => item.id !== action.payload.id || item.selectedSize !== action.payload.selectedSize);
      }
    },

    removeFromBasket: (state, action: PayloadAction<{ id: number; selectedSize: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id || item.selectedSize !== action.payload.selectedSize);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

// ✅ Export selector properly
export const selectCartItems = (state: RootState) => state.basket.items;

export const { updateBasket, decreaseBasket, removeFromBasket, clearCart } = basketSlice.actions;
export default basketSlice.reducer;
