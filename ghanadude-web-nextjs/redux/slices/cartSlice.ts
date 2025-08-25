import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/lib/types'

export type CartItem = {
  product: Product
  quantity: number
  variantId?: number
}

type CartState = {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { product, variantId } = action.payload
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.variantId === variantId
      )
      if (existing) existing.quantity += action.payload.quantity
      else state.items.push(action.payload)
    },
    removeFromCart: (state, action: PayloadAction<{ productId: number; variantId?: number }>) => {
      state.items = state.items.filter(
        (i) => !(i.product.id === action.payload.productId && i.variantId === action.payload.variantId)
      )
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; variantId?: number; quantity: number }>) => {
      const target = state.items.find(
        (i) => i.product.id === action.payload.productId && i.variantId === action.payload.variantId
      )
      if (target) target.quantity = Math.max(1, action.payload.quantity)
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
