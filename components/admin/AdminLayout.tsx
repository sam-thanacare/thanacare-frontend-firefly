'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader2, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      console.log('AdminLayout - Checking access:', {
        isAuthenticated,
        hasToken: !!token,
        userRole: user?.role,
        user: user,
        timestamp: new Date().toISOString(),
      });

      if (!isAuthenticated || !token) {
        console.log('AdminLayout - Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      if (user && user.role !== 'admin') {
        console.log('AdminLayout - Not admin, redirecting to appropriate page');
        if (user.role === 'trainer') {
          router.push('/trainer');
        } else if (user.role === 'member') {
          router.push('/member');
        } else {
          router.push('/guest');
        }
        return;
      }

      // If we have a token but no user yet, wait a bit more
      if (token && !user) {
        console.log('AdminLayout - Has token but no user, waiting...');
        setTimeout(checkAccess, 200);
        return;
      }

      console.log('AdminLayout - Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, token, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verifying Access</h3>
            <p className="text-sm text-muted-foreground">
              {token && !user
                ? 'Loading user information...'
                : 'Checking admin permissions...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              {!user
                ? 'User information not available.'
                : "You don't have permission to access this page. Admin privileges are required."}
            </p>
            <div className="space-y-2">
              {user?.role === 'trainer' && (
                <button
                  onClick={() => router.push('/trainer')}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  Go to Volunteer Dashboard
                </button>
              )}
              {user?.role === 'member' && (
                <button
                  onClick={() => router.push('/member')}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  Go to Member Dashboard
                </button>
              )}
              <button
                onClick={() => router.push('/guest')}
                className="text-sm text-primary hover:underline block w-full"
              >
                Go to Guest Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
