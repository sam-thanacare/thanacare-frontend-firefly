'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginSuccess, clearStoredTokens } from '@/lib/store/slices/authSlice';
import {
  getStoredTokenWithSource,
  isTokenExpired,
  decodeToken,
} from '@/lib/utils/auth';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('AuthInitializer - Effect triggered with state:', {
      isAuthenticated,
      hasUser: !!user,
    });

    // Check for stored auth tokens and restore auth state
    const checkStoredAuth = () => {
      console.log('AuthInitializer - Checking for stored auth tokens...');
      console.log('AuthInitializer - Current state:', {
        isAuthenticated,
        hasUser: !!user,
      });

      try {
        const { token: storedToken, source } = getStoredTokenWithSource();
        console.log('AuthInitializer - Stored token found:', {
          hasToken: !!storedToken,
          source,
        });

        if (storedToken && !isAuthenticated && !user) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log('AuthInitializer - Token expired, clearing storage');
            dispatch(clearStoredTokens());
            return;
          }

          const payload = decodeToken(storedToken);
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

            // Determine if this was a "remember me" token
            // Check if the token was stored in localStorage (persistent) vs sessionStorage (session-only)
            const rememberMe = source === 'localStorage';

            // Only restore auth state if we don't already have a user
            // This prevents overriding fresh login state
            dispatch(loginSuccess({ user, token: storedToken, rememberMe }));
          } else {
            console.warn(
              'AuthInitializer - Invalid token payload, clearing storage'
            );
            dispatch(clearStoredTokens());
          }
        }
      } catch (error) {
        console.error('AuthInitializer - Error restoring auth state:', error);
        // Clear invalid tokens
        dispatch(clearStoredTokens());
      } finally {
        // Mark as initialized regardless of success/failure
        setIsInitialized(true);
      }
    };

    // Add a small delay to ensure login process completes first
    // Increased to 200ms to ensure proper auth state restoration
    const timer = setTimeout(checkStoredAuth, 200);

    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, user]);

  // Don't render children until auth initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
