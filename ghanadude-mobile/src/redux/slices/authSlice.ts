// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  user: {
    user_id: number;
    username: string;
    is_staff: boolean;
    is_superuser: boolean;
  } | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (
      state,
      action: PayloadAction<{
        user: AuthState['user'];
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;

export default authSlice.reducer;
