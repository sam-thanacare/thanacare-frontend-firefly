'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('Home page - Auth state:', {
      isAuthenticated,
      user: user?.name,
      role: user?.role,
    });

    // Wait a moment for auth state to be restored from storage
    const timer = setTimeout(() => {
      console.log('Home page - Checking auth state after delay:', {
        isAuthenticated,
        user: user?.name,
        role: user?.role,
      });

      if (isAuthenticated && user) {
        // User is logged in, redirect based on role
        if (user.role === 'admin') {
          console.log('Home page - Redirecting admin to /admin');
          router.replace('/admin');
        } else {
          // For other roles (trainer, member), redirect to the dashboard
          console.log('Home page - Redirecting user to /dashboard');
          router.replace('/dashboard');
        }
      } else {
        // User is not authenticated, show guest page
        console.log('Home page - Redirecting to /guest (not authenticated)');
        router.replace('/guest');
      }
    }, 300); // Small delay to ensure auth state is restored

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading state while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
