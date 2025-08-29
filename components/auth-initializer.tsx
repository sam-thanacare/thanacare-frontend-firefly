'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginSuccess } from '@/lib/store/slices/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for stored auth tokens and restore auth state
    const checkStoredAuth = () => {
      try {
        // Check localStorage first (remember me), then sessionStorage
        const token =
          localStorage.getItem('authToken') ||
          sessionStorage.getItem('authToken');

        if (token && !isAuthenticated && !user) {
          // Decode JWT to get user info (basic decode, not verification)
          const payload = JSON.parse(atob(token.split('.')[1]));

          if (payload && payload.user_id && payload.email && payload.role) {
            const user = {
              id: payload.user_id,
              email: payload.email,
              role: payload.role,
              name: payload.name || 'User',
            };

            console.log(
              'AuthInitializer - Restoring auth state from stored token'
            );
            console.log('AuthInitializer - User role:', user.role);

            // Only restore auth state if we don't already have a user
            // This prevents overriding fresh login state
            dispatch(loginSuccess({ user, token }));
          }
        }
      } catch (error) {
        console.error('AuthInitializer - Error restoring auth state:', error);
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
    };

    // Add a small delay to ensure login process completes first
    const timer = setTimeout(checkStoredAuth, 500);

    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, user]);

  return <>{children}</>;
}
