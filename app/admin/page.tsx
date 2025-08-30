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
import { LogOut, Users, Shield, Key, Activity } from 'lucide-react';
import { UsersTable } from '@/components/admin/UsersTable';
import { LoginRecordsTable } from '@/components/admin/LoginRecordsTable';
import { PasswordResetPanel } from '@/components/admin/PasswordResetPanel';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

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
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoginRecords: 0,
    successfulLogins: 0,
    failedLogins: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] =
    useState<User | null>(null);

  // Debug: Log current auth state
  useEffect(() => {
    console.log('Admin Dashboard Auth State:', {
      user,
      token: token ? 'Present' : 'Missing',
      isAuthenticated,
      userRole: user?.role,
    });
  }, [user, token, isAuthenticated]);

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

        setStats((prev) => ({
          ...prev,
          totalLoginRecords: totalRecords,
          successfulLogins,
          failedLogins,
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

  const handlePasswordResetRequest = (user: User) => {
    console.log('Admin Dashboard: Password reset requested for user:', user);
    // Use callback to ensure state is updated before tab switch
    setSelectedUserForPasswordReset(user);
    // Switch tabs after state update
    setActiveTab('password-reset');
  };

  const handleUserSelectionChange = (user: User | null) => {
    console.log('Admin Dashboard: User selection changed:', user);
    setSelectedUserForPasswordReset(user);

    // If no user is selected, switch back to users tab
    if (!user && activeTab === 'password-reset') {
      setActiveTab('users');
    }
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
                    Login Attempts
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                      </div>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Health
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    Healthy
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Selected User Indicator */}
            {selectedUserForPasswordReset && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Password Reset Mode
                        </p>
                        <p className="text-xs text-blue-700">
                          Working with:{' '}
                          <strong>{selectedUserForPasswordReset.name}</strong> (
                          {selectedUserForPasswordReset.email})
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUserForPasswordReset(null);
                        setActiveTab('users');
                      }}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger
                  value="users"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
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
                    <UsersTable onPasswordReset={handlePasswordResetRequest} />
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
                      Monitor authentication attempts and security events
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
                    <PasswordResetPanel
                      selectedUser={selectedUserForPasswordReset}
                      onUserSelectionChange={handleUserSelectionChange}
                      key={`password-reset-${selectedUserForPasswordReset?.id || 'no-user'}`} // Force re-render when user changes
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
