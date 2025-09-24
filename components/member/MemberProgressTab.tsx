'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface ProgressData {
  member_id: string;
  member_name: string;
  family_name: string;
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  overall_progress: number;
  last_activity?: string;
}

interface Assignment {
  id: string;
  documentTitle: string;
  status: string;
  progress: number;
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  trainerName: string;
}

export function MemberProgressTab() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        // Fetch progress data
        const progressResponse = await fetch(
          `${backendUrl}/api/member/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('Progress data from API:', progressData);
          setProgressData(progressData);
        } else {
          console.warn(
            'Progress endpoint failed, will calculate from assignments'
          );
        }

        // Fetch assignments for detailed view
        const assignmentsResponse = await fetch(
          `${backendUrl}/api/member/assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (assignmentsResponse.ok) {
          const data = await assignmentsResponse.json();
          const assignmentsData = data.data || data;

          // Ensure assignmentsData is an array before calling map
          if (!Array.isArray(assignmentsData)) {
            console.warn('Assignments data is not an array:', assignmentsData);
            setAssignments([]);
            return;
          }

          // Transform API data to component format
          const transformedAssignments: Assignment[] = assignmentsData.map(
            (assignment: {
              assignment: {
                id: string;
                status: string;
                assigned_at: string;
                due_date?: string;
                completed_at?: string;
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
            }) => ({
              id: assignment.assignment.id,
              documentTitle: assignment.document.title,
              status: assignment.assignment.status,
              progress: assignment.response?.progress || 0,
              assignedAt: assignment.assignment.assigned_at,
              dueDate: assignment.assignment.due_date,
              completedAt: assignment.assignment.completed_at,
              trainerName: assignment.trainer.name,
            })
          );

          setAssignments(transformedAssignments);

          // If we don't have progress data from the API, calculate it from assignments
          if (!progressData && transformedAssignments.length > 0) {
            const total = transformedAssignments.length;
            const completed = transformedAssignments.filter(
              (a) => a.status === 'completed'
            ).length;
            const inProgress = transformedAssignments.filter(
              (a) => a.status === 'in_progress'
            ).length;
            const overallProgress =
              total > 0
                ? Math.round(
                    transformedAssignments.reduce(
                      (sum, a) => sum + a.progress,
                      0
                    ) / total
                  )
                : 0;

            const calculatedProgress: ProgressData = {
              member_id: '',
              member_name: '',
              family_name: '',
              total_assignments: total,
              completed_assignments: completed,
              in_progress_assignments: inProgress,
              overall_progress: overallProgress,
            };

            console.log(
              'Calculated progress from assignments:',
              calculatedProgress
            );
            setProgressData(calculatedProgress);
          }
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'assigned':
        return <Badge className="bg-gray-100 text-gray-800">Assigned</Badge>;
      case 'reviewed':
        return (
          <Badge className="bg-purple-100 text-purple-800">Reviewed</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Overall Progress</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your progress across all assigned documents
          </p>
        </CardHeader>
        <CardContent>
          {progressData ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {isNaN(progressData.overall_progress)
                    ? 0
                    : Math.round(progressData.overall_progress)}
                  %
                </div>
                <Progress
                  value={
                    isNaN(progressData.overall_progress)
                      ? 0
                      : progressData.overall_progress
                  }
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Overall completion rate
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {progressData.total_assignments || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Documents
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {progressData.completed_assignments || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {progressData.in_progress_assignments || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    In Progress
                  </div>
                </div>
              </div>

              {progressData.last_activity && (
                <div className="text-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Last activity: {formatDateTime(progressData.last_activity)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Progress Data</h3>
              <p className="text-muted-foreground">
                Complete some document assignments to see your progress here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your recent document activity and progress
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/member/documents')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Assignments Yet</h3>
              <p className="text-muted-foreground">
                You don&apos;t have any document assignments yet. Your volunteer
                will assign documents when they&apos;re ready for you to
                complete.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">
                            {assignment.documentTitle}
                          </h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Volunteer: {assignment.trainerName}</span>
                          {assignment.completedAt && (
                            <span className="ml-4">
                              Completed: {formatDate(assignment.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">Progress</div>
                      <div className="text-lg font-bold">
                        {assignment.progress}%
                      </div>
                      <Progress value={assignment.progress} className="w-20" />
                    </div>

                    <div className="flex gap-2">
                      {assignment.status === 'completed' ? (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/member/documents/${assignment.id}`)
                          }
                        >
                          {assignment.status === 'assigned' ? (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Start
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Continue
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {assignments.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/member/documents')}
                  >
                    View All {assignments.length} Documents
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
