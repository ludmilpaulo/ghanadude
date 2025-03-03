import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the user object
interface User {
  id: number;
  user_id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  token: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export default authSlice.reducer;
