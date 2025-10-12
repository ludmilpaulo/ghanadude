import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    images: { id: number; image: string }[]
  }
  created_at: string
}

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  error: string | null
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload
      state.loading = false
      state.error = null
    },
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id)
      if (!existingItem) {
        state.items.push(action.payload)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.product.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearWishlist: (state) => {
      state.items = []
      state.error = null
    }
  }
})

export const {
  setWishlistItems,
  addToWishlist,
  removeFromWishlist,
  setLoading,
  setError,
  clearWishlist
} = wishlistSlice.actions

export default wishlistSlice.reducer
