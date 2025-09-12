'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Calendar, Heart, Shield, Users, Activity } from 'lucide-react';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/');
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'trainer':
        return 'Healthcare Trainer';
      case 'member':
        return 'Family Member';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground';
      case 'trainer':
        return 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground';
      case 'member':
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm dark:bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/compassionate_choices.png"
                alt="Compassion & Choices"
                className="h-12 w-auto object-contain"
                width={150}
                height={48}
                priority
              />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Thanacare
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here&apos;s what&apos;s happening with your healthcare journey
            today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Appointments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">
                Upcoming this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Health Records</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">12</p>
              <p className="text-sm text-muted-foreground">
                Documents available
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Care Team</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">100%</p>
              <p className="text-sm text-muted-foreground">Account secure</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1 rounded bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">
                  Last login: {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">
                  Profile updated:{' '}
                  {new Date(Date.now() - 86400000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">
                  New health record added:{' '}
                  {new Date(Date.now() - 172800000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
