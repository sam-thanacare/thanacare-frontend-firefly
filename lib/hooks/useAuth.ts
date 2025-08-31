import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout, updateProfilePicture } from '@/lib/store/slices/authSlice';
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
    refreshUserProfile,
  };
}
