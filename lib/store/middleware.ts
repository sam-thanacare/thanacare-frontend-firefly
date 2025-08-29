import { Middleware } from '@reduxjs/toolkit';
import { clearStoredTokens, loginSuccess, logout } from './slices/authSlice';
import { storeToken, clearStoredTokens as clearTokens } from '../utils/auth';

export const authMiddleware: Middleware = () => (next) => (action) => {
  // Add logging for all actions to help debug
  const actionWithType = action as { type: string; payload?: unknown };
  console.log(
    'AuthMiddleware - Action dispatched:',
    actionWithType.type,
    actionWithType.payload
  );

  // Handle token storage when login is successful
  if (loginSuccess.match(action)) {
    const { token, rememberMe } = action.payload;

    console.log('AuthMiddleware - Processing loginSuccess:', {
      rememberMe,
      hasToken: !!token,
    });

    // Store token based on remember me preference using utility function
    // Default to false if rememberMe is undefined
    storeToken(token, rememberMe ?? false);

    if (rememberMe) {
      console.log(
        'AuthMiddleware - Token stored in localStorage (remember me enabled)'
      );
    } else {
      console.log(
        'AuthMiddleware - Token stored in sessionStorage (remember me disabled)'
      );
    }
  }

  // Handle token clearing when logout occurs
  if (logout.match(action)) {
    clearTokens();
    console.log('AuthMiddleware - Tokens cleared from storage on logout');
  }

  // Handle explicit token clearing
  if (clearStoredTokens.match(action)) {
    clearTokens();
    console.log('AuthMiddleware - Tokens explicitly cleared from storage');
  }

  return next(action);
};
