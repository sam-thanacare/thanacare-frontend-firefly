'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { TrainerLayout } from '@/components/trainer/TrainerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  Users,
  FileText,
  Users2,
  GraduationCap,
  Activity,
  Clock,
  CheckCircle,
  User,
  Settings,
} from 'lucide-react';
import { TrainerFamiliesTable } from '@/components/trainer/TrainerFamiliesTable';
import { TrainerDocumentAssignmentPanel } from '@/components/trainer/TrainerDocumentAssignmentPanel';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthState } from '@/lib/hooks/useAuthState';

export default function TrainerDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { refreshUserProfile } = useAuth();
  const { isTokenReady, makeAuthenticatedCall } = useAuthState();
  const [activeTab, setActiveTab] = useState('families');
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalMembers: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    inProgressAssignments: 0,
    pendingAssignments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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
    if (!isTokenReady || !token) return;

    try {
      setStatsLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Fetch assignments data to calculate all metrics
      const assignmentsResponse = await makeAuthenticatedCall(
        `${backendUrl}/api/dementia-tool/my-assignments`
      );

      let totalFamilies = 0;
      let totalMembers = 0;
      let totalAssignments = 0;
      let completedAssignments = 0;
      let inProgressAssignments = 0;
      let pendingAssignments = 0;

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignments = assignmentsData.data || [];

        // Calculate total assignments
        totalAssignments = assignments.length;

        // Calculate assignment status counts
        completedAssignments = assignments.filter(
          (a: { assignment: { status: string } }) =>
            a.assignment.status === 'completed'
        ).length;
        inProgressAssignments = assignments.filter(
          (a: { assignment: { status: string } }) =>
            a.assignment.status === 'in_progress'
        ).length;
        pendingAssignments = assignments.filter(
          (a: { assignment: { status: string } }) =>
            a.assignment.status === 'assigned'
        ).length;

        // Calculate unique members from assignments
        const uniqueMembers = new Set(
          assignments.map((a: { member: { id: string } }) => a.member.id)
        );
        totalMembers = uniqueMembers.size;

        // Calculate unique families from assignments
        const uniqueFamilies = new Set(
          assignments
            .filter(
              (a: { assignment: { family_id: string } }) =>
                a.assignment.family_id
            )
            .map(
              (a: { assignment: { family_id: string } }) =>
                a.assignment.family_id
            )
        );
        totalFamilies = uniqueFamilies.size;
      }

      setStats({
        totalFamilies,
        totalMembers,
        totalAssignments,
        completedAssignments,
        inProgressAssignments,
        pendingAssignments,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set to 0 on error instead of showing dummy data
      setStats({
        totalFamilies: 0,
        totalMembers: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        inProgressAssignments: 0,
        pendingAssignments: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, [isTokenReady, token, makeAuthenticatedCall]);

  useEffect(() => {
    // Only fetch stats when token is ready and available
    if (isTokenReady && token) {
      fetchStats();
    }
  }, [isTokenReady, token, fetchStats]);

  const handleLogout = () => {
    dispatch(logout()); // This will also clear stored tokens via middleware
    router.push('/login');
  };

  return (
    <TrainerLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">Trainer Dashboard</h1>
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
                  <GraduationCap className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    Healthcare Trainer
                  </span>
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
                      {user?.name?.charAt(0)?.toUpperCase() || 'T'}
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
                    Total Families
                  </CardTitle>
                  <Users2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                      </div>
                    ) : (
                      stats.totalFamilies
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Families under your care
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
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
                      stats.totalMembers
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Family members assigned
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Assignments
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                    ) : (
                      stats.totalAssignments
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading
                      ? 'Total dementia tool assignments'
                      : `${stats.completedAssignments} completed, ${stats.inProgressAssignments} in progress`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                console.log(
                  'Trainer Dashboard: Tab changed from',
                  activeTab,
                  'to',
                  value
                );
                setActiveTab(value);
              }}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                <TabsTrigger
                  value="families"
                  className="flex items-center space-x-2"
                >
                  <Users2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Families</span>
                </TabsTrigger>
                <TabsTrigger
                  value="assignments"
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Assignments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="families" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users2 className="h-5 w-5" />
                      <span>Family Management</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and manage families in your organization
                    </p>
                  </CardHeader>
                  <CardContent>
                    <TrainerFamiliesTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments" className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Completed
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">
                          {stats.completedAssignments}
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
                        <Clock className="h-4 w-4 text-accent" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-accent">
                          {stats.inProgressAssignments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Currently working on
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pending
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                          {stats.pendingAssignments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Awaiting start
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <TrainerDocumentAssignmentPanel />
                </div>
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
                        onClick={() => router.push('/trainer/profile')}
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
    </TrainerLayout>
  );
}
