import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { isTokenExpiringSoon, getStoredToken } from '@/lib/utils/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error, rememberMe } =
    useAppSelector((state) => state.auth);

  // Check token expiration and handle refresh
  const checkTokenExpiration = useCallback(() => {
    if (!token) return;

    // Check if token is expiring soon (within 5 minutes)
    if (isTokenExpiringSoon(token, 5)) {
      console.log('Token expiring soon, user should re-authenticate');
      // For now, we'll just log out the user when token expires
      // In a production app, you might want to implement token refresh
      dispatch(logout());
    }
  }, [token, dispatch]);

  // Set up periodic token expiration checks
  useEffect(() => {
    if (!token) return;

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    // Also check immediately
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [token, checkTokenExpiration]);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken && !token) {
      console.log(
        'Found stored token, auth state should be restored by AuthInitializer'
      );
    }
  }, [token]);

  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const isMember = user?.role === 'member';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    rememberMe,
    isAdmin,
    isTrainer,
    isMember,
    checkTokenExpiration,
  };
}
