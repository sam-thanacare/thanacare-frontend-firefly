import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout, updateProfilePicture } from '@/lib/store/slices/authSlice';
import { isTokenExpiringSoon, getStoredToken } from '@/lib/utils/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error, rememberMe } =
    useAppSelector((state) => state.auth);

  // Add local state to track if the hook has fully initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Check token expiration and handle refresh
  const checkTokenExpiration = useCallback(() => {
    if (!token) return;

    try {
      // Check if token is expiring soon (within 5 minutes)
      if (isTokenExpiringSoon(token, 5)) {
        console.log('Token expiring soon, user should re-authenticate');
        // For now, we'll just log out the user when token expires
        // In a production app, you might want to implement token refresh
        dispatch(logout());
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // If we can't check the token, log out for safety
      dispatch(logout());
    }
  }, [token, dispatch]);

  // Refresh user profile data to ensure profile picture is up to date
  const refreshUserProfile = useCallback(async () => {
    if (!token) return;

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile refresh response:', data);

        // Check if we have valid user data
        if (data.data && data.data.profile_picture_url !== undefined) {
          const newProfilePictureUrl = data.data.profile_picture_url;
          console.log(
            'Updating profile picture in store:',
            newProfilePictureUrl
          );
          dispatch(updateProfilePicture(newProfilePictureUrl));
        } else if (
          data.data &&
          data.data.user &&
          data.data.user.profile_picture_url !== undefined
        ) {
          const newProfilePictureUrl = data.data.user.profile_picture_url;
          console.log(
            'Updating profile picture in store:',
            newProfilePictureUrl
          );
          dispatch(updateProfilePicture(newProfilePictureUrl));
        } else {
          console.log(
            'No profile picture URL found in response or user data is incomplete'
          );
        }
      } else {
        console.warn(
          'Failed to refresh profile:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
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

  // Refresh profile on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('useAuth: Refreshing profile on mount');
      refreshUserProfile();
    }
  }, [isAuthenticated, token, refreshUserProfile]);

  // Mark the hook as initialized after the first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Validate user data integrity
  const isValidUser = user && user.id && user.email && user.role;
  const isValidAuthState = isAuthenticated && isValidUser && token;

  const isAdmin = isValidUser && user.role === 'admin';
  const isTrainer = isValidUser && user.role === 'trainer';
  const isMember = isValidUser && user.role === 'member';

  return {
    user,
    token,
    isAuthenticated: isValidAuthState,
    isLoading: isLoading || !isInitialized,
    error,
    rememberMe,
    isAdmin,
    isTrainer,
    isMember,
    checkTokenExpiration,
    refreshUserProfile,
    // Add validation helpers
    isValidUser,
    isValidAuthState,
  };
}
