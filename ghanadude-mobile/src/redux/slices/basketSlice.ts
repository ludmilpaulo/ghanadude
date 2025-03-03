import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { product } from "../../utils/types";

interface BasketState {
  items: (product & { quantity: number })[];
}

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    updateBasket: (state, action: PayloadAction<product>) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id);

      if (index >= 0) {
        // Update the quantity of the existing product immutably
        const updatedItems = [...state.items];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: updatedItems[index].quantity + 1,
        };
        state.items = updatedItems;
      } else {
        // Add the product to the basket with quantity 1
        state.items.push({ ...product, quantity: 1 });
      }
    },
    decreaseBasket: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const index = state.items.findIndex((item) => item.id === productId);

      if (index >= 0 && state.items[index].quantity > 1) {
        // Decrease the quantity of the existing product immutably
        const updatedItems = [...state.items];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: updatedItems[index].quantity - 1,
        };
        state.items = updatedItems;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
      }
    },
    removeFromBasket: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
    },
    removeOrderedItems: (state, action: PayloadAction<number[]>) => {
      // Remove items from cart that were successfully ordered
      const orderedproductIds = action.payload;
      state.items = state.items.filter(
        (item) => !orderedproductIds.includes(item.id),
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  updateBasket,
  decreaseBasket,
  removeFromBasket,
  clearCart,
  removeOrderedItems,
} = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;