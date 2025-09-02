'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';

import { MemberDashboard as MemberDashboardComponent } from '@/components/member/MemberDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  FileText,
  User,
  Heart,
  Activity,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MemberDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChecking, setIsChecking] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    completedDocuments: 0,
    inProgressDocuments: 0,
    assignedDocuments: 0,
    overallProgress: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const checkAccess = () => {
      if (!isAuthenticated || !token) {
        console.log(
          'MemberDashboard - Not authenticated, redirecting to login'
        );
        router.push('/login');
        return;
      }

      if (user && user.role !== 'member') {
        console.log(
          'MemberDashboard - Not a member, redirecting to appropriate page'
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

      // If we have a token but no user yet, wait a bit more
      if (token && !user) {
        console.log('MemberDashboard - Has token but no user, waiting...');
        setTimeout(checkAccess, 200);
        return;
      }

      console.log('MemberDashboard - Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, token, user, router]);

  // Refresh user profile on component mount to ensure profile picture is up to date
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshUserProfile();
    }
  }, [isAuthenticated, token, refreshUserProfile]);

  // Callback to refresh profile data when profile picture is updated
  // const handleProfileUpdate = useCallback(() => {
  //   if (isAuthenticated && token) {
  //     refreshUserProfile();
  //   }
  // }, [isAuthenticated, token, refreshUserProfile]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      setStatsLoading(true);
      // const backendUrl =
      //   process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Mock data for now - in real implementation, these would be API calls
      setStats({
        totalDocuments: 3,
        completedDocuments: 1,
        inProgressDocuments: 1,
        assignedDocuments: 1,
        overallProgress: 67,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    dispatch(logout()); // This will also clear stored tokens via middleware
    router.push('/login');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verifying Access</h3>
            <p className="text-sm text-muted-foreground">
              {token && !user
                ? 'Loading user information...'
                : 'Checking member permissions...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              {!user
                ? 'User information not available.'
                : "You don't have permission to access this page. Member privileges are required."}
            </p>
            <div className="space-y-2">
              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  Go to Admin Dashboard
                </button>
              )}
              {user?.role === 'trainer' && (
                <button
                  onClick={() => router.push('/trainer')}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  Go to Trainer Dashboard
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Member Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    Welcome back, {user?.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="hidden sm:flex items-center space-x-1 px-2 py-1"
              >
                <Heart className="h-3 w-3" />
                <span className="text-xs font-medium">Family Member</span>
              </Badge>
              <div className="flex items-center space-x-3">
                <Avatar
                  className="h-8 w-8"
                  key={user?.profile_picture_url || 'no-picture'}
                >
                  <AvatarImage
                    src={user?.profile_picture_url || undefined}
                    alt={user?.name || 'Profile'}
                  />
                  <AvatarFallback className="text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                    </div>
                  ) : (
                    stats.totalDocuments
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Documents assigned to you
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                  ) : (
                    stats.completedDocuments
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statsLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                  ) : (
                    stats.inProgressDocuments
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently working on
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Progress
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                  ) : (
                    `${stats.overallProgress}%`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Of all documents
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              console.log(
                'Member Dashboard: Tab changed from',
                activeTab,
                'to',
                value
              );
              setActiveTab(value);
            }}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger
                value="overview"
                className="flex items-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MemberDashboardComponent />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Document Assignments</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your assigned dementia care planning documents and their
                    current status
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Document Management
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Detailed document management features will be available
                      here
                    </p>
                    <Button onClick={() => router.push('/member/documents')}>
                      <FileText className="h-4 w-4 mr-2" />
                      View All Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Progress Tracking</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your progress through dementia care planning documents
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Progress Analytics
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Detailed progress tracking and analytics will be available
                      here
                    </p>
                    <Button onClick={() => router.push('/dementia-tool-demo')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Progress Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Management</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your personal information and account settings
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => router.push('/member/profile')}
                    >
                      <User className="h-6 w-6" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => router.push('/change-password')}
                    >
                      <Settings className="h-6 w-6" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
