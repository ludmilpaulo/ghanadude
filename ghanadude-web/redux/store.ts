import { configureStore } from '@reduxjs/toolkit'
import { api } from './svc/api'
import cartReducer from './slices/cartSlice'
import authReducer from "./slices/authSlice"
import wishlistReducer from './slices/wishlistSlice'
import designReducer from './slices/designSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    cart: cartReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    design: designReducer,
  },
  middleware: (getDefault) => getDefault()
    .concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
