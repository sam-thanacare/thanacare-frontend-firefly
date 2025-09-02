'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { MemberLayout } from '@/components/member/MemberLayout';
import { MemberDashboard } from '@/components/member/MemberDashboard';

export default function MemberPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (!isAuthenticated) {
        console.log('MemberPage - Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      if (user && user.role !== 'member') {
        console.log(
          'MemberPage - Not a member, redirecting to appropriate page'
        );
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'trainer') {
          router.push('/trainer');
        } else {
          router.push('/guest');
        }
        return;
      }

      console.log('MemberPage - Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verifying Access</h3>
            <p className="text-sm text-muted-foreground">
              Checking member permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'member') {
    return null;
  }

  return (
    <MemberLayout>
      <MemberDashboard />
    </MemberLayout>
  );
}
