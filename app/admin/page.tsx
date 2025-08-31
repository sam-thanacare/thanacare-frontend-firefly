'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  Users,
  Shield,
  Key,
  Activity,
  Building2,
  Camera,
} from 'lucide-react';
import { UsersTable } from '@/components/admin/UsersTable';
import { LoginRecordsTable } from '@/components/admin/LoginRecordsTable';
import { PasswordResetPanel } from '@/components/admin/PasswordResetPanel';
import { OrganizationsTable } from '@/components/admin/OrganizationsTable';
import { ProfilePictureUpload } from '@/components/admin/ProfilePictureUpload';
import { useAuth } from '@/lib/hooks/useAuth';

interface LoginRecord {
  id: string;
  user_id: string | null;
  email: string;
  user_agent: string | null;
  ip_address: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalLoginRecords: 0,
    successfulLogins: 0,
    failedLogins: 0,
    recentActivity: 0,
    uniqueIPs: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Refresh user profile on component mount to ensure profile picture is up to date
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshUserProfile();
    }
  }, [isAuthenticated, token, refreshUserProfile]);

  // Callback to refresh profile data when profile picture is updated
  const handleProfileUpdate = useCallback(() => {
    if (isAuthenticated && token) {
      refreshUserProfile();
    }
  }, [isAuthenticated, token, refreshUserProfile]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      setStatsLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Fetch users count
      const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const users = usersData.data || [];
        setStats((prev) => ({ ...prev, totalUsers: users.length }));
      }

      // Fetch organizations count
      const orgsResponse = await fetch(`${backendUrl}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        const orgs = orgsData.data || [];
        setStats((prev) => ({ ...prev, totalOrganizations: orgs.length }));
      }

      // Fetch login records count
      const loginResponse = await fetch(
        `${backendUrl}/api/admin/login-records?limit=1000&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const records = loginData.data.records || [];
        const totalRecords = loginData.data.total_count || records.length;
        const successfulLogins = records.filter(
          (r: LoginRecord) => r.success
        ).length;
        const failedLogins = records.filter(
          (r: LoginRecord) => !r.success
        ).length;

        // Calculate additional metrics
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentActivity = records.filter(
          (r: LoginRecord) => new Date(r.created_at) > oneDayAgo
        ).length;
        const uniqueIPs = new Set(
          records
            .filter((r: LoginRecord) => r.ip_address)
            .map((r: LoginRecord) => r.ip_address)
        ).size;

        setStats((prev) => ({
          ...prev,
          totalLoginRecords: totalRecords,
          successfulLogins,
          failedLogins,
          recentActivity,
          uniqueIPs,
        }));
      }
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

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
                  <Shield className="h-3 w-3" />
                  <span className="text-xs font-medium">Administrator</span>
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
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                      </div>
                    ) : (
                      stats.totalUsers
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active user accounts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Organizations
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                      </div>
                    ) : (
                      stats.totalOrganizations
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active organizations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Login Attempts
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                    ) : (
                      stats.totalLoginRecords
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading
                      ? 'Total authentication events'
                      : `${stats.successfulLogins} successful, ${stats.failedLogins} failed`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                console.log(
                  'Admin Dashboard: Tab changed from',
                  activeTab,
                  'to',
                  value
                );
                setActiveTab(value);
              }}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                <TabsTrigger
                  value="users"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="organizations"
                  className="flex items-center space-x-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Orgs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="login-records"
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password-reset"
                  className="flex items-center space-x-2"
                >
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>User Management</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and manage all user accounts in the system
                    </p>
                  </CardHeader>
                  <CardContent>
                    <UsersTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organizations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Organization Management</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create, view, and manage all organizations in the system
                    </p>
                  </CardHeader>
                  <CardContent>
                    <OrganizationsTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="login-records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Login Activity</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Monitor authentication attempts and security events in
                      real-time
                    </p>
                  </CardHeader>
                  <CardContent>
                    <LoginRecordsTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password-reset" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="h-5 w-5" />
                      <span>Password Management</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generate secure passwords and reset user credentials
                    </p>
                  </CardHeader>
                  <CardContent>
                    <PasswordResetPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <ProfilePictureUpload onUpdate={handleProfileUpdate} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
