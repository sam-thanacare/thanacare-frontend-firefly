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
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { TrainerFamiliesTable } from '@/components/trainer/TrainerFamiliesTable';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TrainerDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { refreshUserProfile } = useAuth();
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
    if (!token) return;

    try {
      setStatsLoading(true);
      // const backendUrl =
      //   process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Mock data for now - in real implementation, these would be API calls
      // Fetch families count
      setStats((prev) => ({ ...prev, totalFamilies: 12 }));

      // Fetch members count
      setStats((prev) => ({ ...prev, totalMembers: 45 }));

      // Fetch assignments count
      setStats((prev) => ({
        ...prev,
        totalAssignments: 28,
        completedAssignments: 15,
        inProgressAssignments: 8,
        pendingAssignments: 5,
      }));
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
              <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
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
                  value="progress"
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Progress</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tools"
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Tools</span>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Assignment Management</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and manage dementia tool assignments for your
                      families
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Completed
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
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
                            <Clock className="h-4 w-4 text-blue-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
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
                            <Activity className="h-4 w-4 text-orange-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                              {stats.pendingAssignments}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Awaiting start
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Assignment Details
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Detailed assignment management features will be
                          available here
                        </p>
                        <Button
                          onClick={() => router.push('/dementia-tool-demo')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Manage Assignments
                        </Button>
                      </div>
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
                      Monitor family member progress and engagement
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Progress Analytics
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Detailed progress tracking and analytics will be
                        available here
                      </p>
                      <Button
                        onClick={() => router.push('/trainer-dashboard-demo')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Progress Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Dementia Tools</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Access and manage dementia care planning tools
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={() => router.push('/dementia-tool-demo')}
                      >
                        <FileText className="h-6 w-6" />
                        Dementia Values Tool
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={() => router.push('/trainer-dashboard-demo')}
                      >
                        <Users className="h-6 w-6" />
                        Member Progress View
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
