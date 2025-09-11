import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';

/**
 * Custom hook to manage authentication state with proper token availability
 * This ensures API calls only happen when the token is actually available
 */
export function useAuthState() {
  const { user, token, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [isTokenReady, setIsTokenReady] = useState(false);
  const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);

  // Check if we have all required authentication data
  const hasValidUser = user && user.id && user.email && user.role;
  const hasValidToken = token && token.length > 0;

  // Update token readiness
  useEffect(() => {
    if (hasValidToken && !isTokenReady) {
      // Immediate readiness check - no artificial delay
      setIsTokenReady(true);
    } else if (!hasValidToken && isTokenReady) {
      setIsTokenReady(false);
    }
  }, [hasValidToken, isTokenReady]);

  // Update full authentication state
  useEffect(() => {
    const fullyAuth = Boolean(
      isAuthenticated && hasValidUser && hasValidToken && isTokenReady
    );
    setIsFullyAuthenticated(fullyAuth);
  }, [isAuthenticated, hasValidUser, hasValidToken, isTokenReady]);

  // Function to wait for token to be ready
  const waitForToken = useCallback(
    async (timeout = 5000): Promise<boolean> => {
      if (isTokenReady) return true;

      return new Promise((resolve) => {
        const startTime = Date.now();
        const checkToken = () => {
          if (isTokenReady) {
            resolve(true);
          } else if (Date.now() - startTime >= timeout) {
            resolve(false);
          } else {
            setTimeout(checkToken, 100);
          }
        };
        checkToken();
      });
    },
    [isTokenReady]
  );

  // Function to make authenticated API calls safely
  const makeAuthenticatedCall = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      if (!isTokenReady || !token) {
        console.error('makeAuthenticatedCall: Token not ready', {
          isTokenReady,
          hasToken: !!token,
          tokenLength: token?.length,
        });
        throw new Error('Token not ready for API call');
      }

      console.log('makeAuthenticatedCall: Making request to', url, {
        hasToken: !!token,
        tokenPreview: token?.substring(0, 20) + '...',
      });

      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    },
    [isTokenReady, token]
  );

  return {
    user,
    token,
    isAuthenticated: isFullyAuthenticated,
    isLoading: isLoading || !isTokenReady,
    isTokenReady,
    hasValidUser,
    hasValidToken,
    waitForToken,
    makeAuthenticatedCall,
    // Role helpers
    isAdmin: hasValidUser && user?.role === 'admin',
    isTrainer: hasValidUser && user?.role === 'trainer',
    isMember: hasValidUser && user?.role === 'member',
  };
}
