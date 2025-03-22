import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store"; // ✅ Import RootState

interface CartItem {
  id: number;
  name: string;
  selectedSize: string;
  quantity: number;
  image: string;
  price: number; // final price (after discount)
  originalPrice: number; // original price before discount
  stock: number;
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
        (item) => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
      );
    
      if (index >= 0) {
        // Prevent exceeding stock
        if (state.items[index].quantity < state.items[index].stock) {
          state.items[index].quantity += 1;
        }
      } else {
        state.items.push(action.payload);
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
