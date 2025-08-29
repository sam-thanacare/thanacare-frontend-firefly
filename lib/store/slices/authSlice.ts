import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean; // Add remember me preference to state
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  rememberMe: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state: AuthState,
      action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.rememberMe = action.payload.rememberMe || false;
      state.error = null;
    },
    loginFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.rememberMe = false;
      state.error = action.payload;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.rememberMe = false;
      state.error = null;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
    clearStoredTokens: () => {
      // This action will be handled by a middleware to clear localStorage/sessionStorage
      // The state itself doesn't change, but we mark it for the middleware
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  clearStoredTokens,
} = authSlice.actions;

export default authSlice.reducer;
