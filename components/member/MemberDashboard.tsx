'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  Clock,
  CheckCircle,
  Edit,
  Eye,
  Calendar,
  User,
  TrendingUp,
  BookOpen,
  Settings,
  Heart,
  Sparkles,
} from 'lucide-react';
import { debugLogger } from '@/lib/utils/debugLogger';

interface Assignment {
  id: string;
  documentTitle: string;
  status: string;
  progress: number;
  assignedAt: string;
  dueDate?: string;
  notes?: string;
  trainerName: string;
}

interface FireflyAssignment {
  id: string;
  document_title: string;
  status: string;
  progress: number;
  assigned_at: string;
  due_date?: string;
  notes?: string;
  trainer_name: string;
  family_name: string;
}

export function MemberDashboard() {
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [fireflyAssignments, setFireflyAssignments] = useState<
    FireflyAssignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    assigned: 0,
    overallProgress: 0,
  });
  const [fireflyStats, setFireflyStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    assigned: 0,
    overallProgress: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Load real assignments from API
  useEffect(() => {
    const loadAssignments = async () => {
      debugLogger.info('MemberDashboard', 'Starting to load assignments');
      debugLogger.info('MemberDashboard', 'User ID', { userId: user?.id });
      debugLogger.info('MemberDashboard', 'Token exists', {
        hasToken: !!token,
      });

      if (!user?.id) {
        debugLogger.warn(
          'MemberDashboard',
          'No user ID, skipping assignment load'
        );
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        console.log('🌐 MemberDashboard: Backend URL:', backendUrl);

        if (!token) {
          console.error('❌ MemberDashboard: No authentication token found');
          throw new Error('Authentication required');
        }

        console.log(
          '📡 MemberDashboard: Making API call to:',
          `${backendUrl}/api/dementia-tool/my-assignments`
        );
        console.log(
          '🔐 MemberDashboard: Using token (first 20 chars):',
          token.substring(0, 20) + '...'
        );

        const response = await fetch(
          `${backendUrl}/api/dementia-tool/my-assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(
          '📊 MemberDashboard: API Response status:',
          response.status
        );
        console.log(
          '📊 MemberDashboard: API Response headers:',
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            '❌ MemberDashboard: API Error:',
            response.status,
            errorText
          );
          throw new Error(
            `Failed to load assignments: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('📦 MemberDashboard: Raw API response:', data);

        const assignmentsData = data.data || data;
        console.log('📋 MemberDashboard: Assignments data:', assignmentsData);

        // Ensure assignmentsData is an array before calling map
        if (!Array.isArray(assignmentsData)) {
          console.warn(
            '⚠️ MemberDashboard: Assignments data is not an array:',
            assignmentsData
          );
          setAssignments([]);
          setStats({
            total: 0,
            completed: 0,
            inProgress: 0,
            assigned: 0,
            overallProgress: 0,
          });
          return;
        }

        // Transform API data to component format
        console.log('🔄 MemberDashboard: Transforming assignments data...');
        const transformedAssignments: Assignment[] = assignmentsData.map(
          (assignment: {
            assignment: {
              id: string;
              status: string;
              assigned_at: string;
              due_date?: string;
              notes?: string;
            };
            document: {
              title: string;
            };
            response?: {
              progress: number;
            };
            trainer: {
              name: string;
            };
          }) => {
            console.log(
              '📝 MemberDashboard: Processing assignment:',
              assignment
            );
            return {
              id: assignment.assignment.id,
              documentTitle: assignment.document.title,
              status: assignment.assignment.status,
              progress: assignment.response?.progress || 0,
              assignedAt: assignment.assignment.assigned_at,
              dueDate: assignment.assignment.due_date,
              notes: assignment.assignment.notes,
              trainerName: assignment.trainer.name,
            };
          }
        );

        console.log(
          '✅ MemberDashboard: Transformed assignments:',
          transformedAssignments
        );
        setAssignments(transformedAssignments);

        // Calculate stats
        const total = transformedAssignments.length;
        const completed = transformedAssignments.filter(
          (a) => a.status === 'completed'
        ).length;
        const inProgress = transformedAssignments.filter(
          (a) => a.status === 'in_progress'
        ).length;
        const assigned = transformedAssignments.filter(
          (a) => a.status === 'assigned'
        ).length;
        const overallProgress =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        console.log('📊 MemberDashboard: Calculated stats:', {
          total,
          completed,
          inProgress,
          assigned,
          overallProgress,
        });
        setStats({ total, completed, inProgress, assigned, overallProgress });
        console.log('✅ MemberDashboard: Successfully loaded assignments');

        // Load Firefly Documents assignments
        try {
          console.log(
            '📡 MemberDashboard: Loading Firefly Documents assignments...'
          );
          const fireflyResponse = await fetch(
            `${backendUrl}/api/member/firefly-assignments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (fireflyResponse.ok) {
            const fireflyData = await fireflyResponse.json();
            const fireflyAssignmentsData = fireflyData.data || fireflyData;

            if (Array.isArray(fireflyAssignmentsData)) {
              setFireflyAssignments(fireflyAssignmentsData);

              // Calculate Firefly stats
              const fireflyTotal = fireflyAssignmentsData.length;
              const fireflyCompleted = fireflyAssignmentsData.filter(
                (a: FireflyAssignment) => a.status === 'completed'
              ).length;
              const fireflyInProgress = fireflyAssignmentsData.filter(
                (a: FireflyAssignment) => a.status === 'in_progress'
              ).length;
              const fireflyAssigned = fireflyAssignmentsData.filter(
                (a: FireflyAssignment) => a.status === 'assigned'
              ).length;
              const fireflyOverallProgress =
                fireflyTotal > 0
                  ? Math.round((fireflyCompleted / fireflyTotal) * 100)
                  : 0;

              setFireflyStats({
                total: fireflyTotal,
                completed: fireflyCompleted,
                inProgress: fireflyInProgress,
                assigned: fireflyAssigned,
                overallProgress: fireflyOverallProgress,
              });
            }
          } else {
            console.warn(
              '⚠️ MemberDashboard: Failed to load Firefly assignments:',
              fireflyResponse.status
            );
          }
        } catch (fireflyError) {
          console.warn(
            '⚠️ MemberDashboard: Error loading Firefly assignments:',
            fireflyError
          );
        }
      } catch (error) {
        console.error('❌ MemberDashboard: Error loading assignments:', error);
        console.error('❌ MemberDashboard: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });
        setError(
          error instanceof Error ? error.message : 'Failed to load assignments'
        );
        // Set empty state on error
        setAssignments([]);
        setStats({
          total: 0,
          completed: 0,
          inProgress: 0,
          assigned: 0,
          overallProgress: 0,
        });
      } finally {
        console.log('🏁 MemberDashboard: Assignment loading completed');
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [user?.id, token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-primary/10 text-primary">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-accent/10 text-accent">In Progress</Badge>;
      case 'assigned':
        return (
          <Badge className="bg-muted text-muted-foreground">Assigned</Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">{status}</Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-destructive">
                Error Loading Dashboard
              </h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Stats */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg shadow-sm border border-primary/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                <AvatarImage src={user?.profile_picture_url} alt={user?.name} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s an overview of your dementia care planning journey
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="space-y-6">
          {/* Dementia Tool Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Dementia Care Planning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Documents
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Documents assigned to you
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stats.completed}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {stats.inProgress}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently working on
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.overallProgress}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of all documents
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Firefly Documents Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500" />
              Firefly Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Documents
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {fireflyStats.total}
                  </div>
                  <p className="text-xs text-purple-600">
                    Health care planning documents
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {fireflyStats.completed}
                  </div>
                  <p className="text-xs text-green-600">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {fireflyStats.inProgress}
                  </div>
                  <p className="text-xs text-blue-600">Currently working on</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {fireflyStats.overallProgress}%
                  </div>
                  <p className="text-xs text-purple-600">Of all documents</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="space-y-6">
        {/* Dementia Tool Assignments */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Dementia Care Planning Documents
            </CardTitle>
            <CardDescription>
              Your assigned dementia care planning documents and their current
              status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-all bg-gradient-to-r from-background to-muted/20"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">
                        {assignment.documentTitle}
                      </h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigned by {assignment.trainerName} on{' '}
                      {formatDate(assignment.assignedAt)}
                    </p>
                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground">
                        {assignment.notes}
                      </p>
                    )}
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {assignment.progress}%
                      </div>
                      <Progress value={assignment.progress} className="w-20" />
                    </div>

                    <div className="flex gap-2">
                      {assignment.status === 'completed' ? (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log(
                              '🚀 MemberDashboard: Start/Continue button clicked'
                            );
                            console.log(
                              '📄 MemberDashboard: Assignment details:',
                              {
                                id: assignment.id,
                                title: assignment.documentTitle,
                                status: assignment.status,
                                progress: assignment.progress,
                              }
                            );
                            console.log(
                              '🔗 MemberDashboard: Navigating to:',
                              `/member/documents/${assignment.id}`
                            );
                            router.push(`/member/documents/${assignment.id}`);
                          }}
                        >
                          {assignment.status === 'assigned' ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Start
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Continue
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Documents Assigned
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You don&apos;t have any dementia tool documents assigned
                    yet. Your trainer will assign documents when they&apos;re
                    ready for you to complete.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Firefly Documents Assignments */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-100">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              Firefly Documents
            </CardTitle>
            <CardDescription>
              Your assigned health care planning documents for values, goals,
              and wishes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fireflyAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all bg-gradient-to-r from-white to-purple-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-purple-900">
                        {assignment.document_title}
                      </h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-sm text-purple-700">
                      Assigned by {assignment.trainer_name} on{' '}
                      {formatDate(assignment.assigned_at)}
                    </p>
                    {assignment.notes && (
                      <p className="text-sm text-purple-600">
                        {assignment.notes}
                      </p>
                    )}
                    {assignment.due_date && (
                      <div className="flex items-center gap-1 text-sm text-purple-600">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.due_date)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-700">
                        {assignment.progress}%
                      </div>
                      <Progress value={assignment.progress} className="w-20" />
                    </div>

                    <div className="flex gap-2">
                      {assignment.status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            console.log(
                              '🚀 MemberDashboard: Firefly Document button clicked'
                            );
                            console.log(
                              '📄 MemberDashboard: Firefly Assignment details:',
                              {
                                id: assignment.id,
                                title: assignment.document_title,
                                status: assignment.status,
                                progress: assignment.progress,
                              }
                            );
                            console.log(
                              '🔗 MemberDashboard: Navigating to:',
                              `/member/firefly-documents/${assignment.id}`
                            );
                            router.push(
                              `/member/firefly-documents/${assignment.id}`
                            );
                          }}
                        >
                          {assignment.status === 'assigned' ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Start
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Continue
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {fireflyAssignments.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    No Firefly Documents Assigned
                  </h3>
                  <p className="text-purple-600 mb-4">
                    You don&apos;t have any Firefly Documents assigned yet. Your
                    trainer will assign documents when they&apos;re ready for
                    you to complete.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1 rounded bg-accent/10">
              <Settings className="h-5 w-5 text-accent" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
              onClick={() => router.push('/member/documents')}
            >
              <FileText className="h-6 w-6 text-primary" />
              Dementia Documents
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
              onClick={() => router.push('/member/firefly-documents')}
            >
              <Heart className="h-6 w-6 text-purple-600" />
              Firefly Documents
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-accent/5 hover:border-accent/30 transition-all"
              onClick={() => router.push('/member/profile')}
            >
              <User className="h-6 w-6 text-accent" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-muted/50 hover:border-muted/50 transition-all"
              onClick={() => router.push('/change-password')}
            >
              <Settings className="h-6 w-6 text-muted-foreground" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
