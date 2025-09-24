'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface Assignment {
  id: string;
  documentTitle: string;
  status: string;
  progress: number;
  assignedAt: string;
  dueDate?: string;
  notes?: string;
  trainerName: string;
  familyName?: string;
}

export function MemberDocumentsTab() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        const response = await fetch(`${backendUrl}/api/member/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
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
              family: {
                name: string;
              };
            }) => ({
              id: assignment.assignment.id,
              documentTitle: assignment.document.title,
              status: assignment.assignment.status,
              progress: assignment.response?.progress || 0,
              assignedAt: assignment.assignment.assigned_at,
              dueDate: assignment.assignment.due_date,
              notes: assignment.assignment.notes,
              trainerName: assignment.trainer.name,
              familyName: assignment.family.name,
            })
          );

          setAssignments(transformedAssignments);
        } else {
          console.error('Failed to fetch assignments');
          setAssignments([]);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
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

  const getStatusCount = (status: string) => {
    return assignments.filter((a) => a.status === status).length;
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {getStatusCount('completed')}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {getStatusCount('in_progress')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {getStatusCount('assigned')}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Assignments</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your assigned firefly care planning documents
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
              <h3 className="text-lg font-medium mb-2">
                No Documents Assigned
              </h3>
              <p className="text-muted-foreground">
                You don&apos;t have any firefly tool documents assigned yet.
                Your volunteer will assign documents when they&apos;re ready for
                you to complete.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 3).map((assignment) => (
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
                          {assignment.dueDate && (
                            <span className="ml-4">
                              Due: {formatDate(assignment.dueDate)}
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
                          <Eye className="h-4 w-4 mr-2" />
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

              {assignments.length > 3 && (
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
