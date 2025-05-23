import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import basketReducer from "./slices/basketSlice";
import designReducer from "./slices/designSlice";
import wishlistReducer from "./slices/wishlistSlice"; // ✅ Import wishlist slice

import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

const rootPersistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  basket: basketReducer,
  auth: authReducer,
  products: productReducer,
  design: designReducer,
  wishlist: wishlistReducer, // ✅ Add wishlist to persisted reducer
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
