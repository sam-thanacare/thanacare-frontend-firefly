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
}

export function MemberDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    assigned: 0,
    overallProgress: 0,
  });

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        documentTitle: 'Dementia Values & Priorities Tool',
        status: 'completed',
        progress: 100,
        assignedAt: '2024-01-10T10:00:00Z',
        dueDate: '2024-01-15T10:00:00Z',
        notes:
          'Please complete this important document to help guide your future care decisions.',
        trainerName: 'Dr. Sarah Wilson',
      },
      {
        id: '2',
        documentTitle: 'Dementia Values & Priorities Tool - Updated',
        status: 'in_progress',
        progress: 60,
        assignedAt: '2024-01-12T10:00:00Z',
        dueDate: '2024-01-20T10:00:00Z',
        notes:
          'Updated version with additional questions about end-of-life preferences.',
        trainerName: 'Dr. Sarah Wilson',
      },
    ];

    setAssignments(mockAssignments);

    // Calculate stats
    const total = mockAssignments.length;
    const completed = mockAssignments.filter(
      (a) => a.status === 'completed'
    ).length;
    const inProgress = mockAssignments.filter(
      (a) => a.status === 'in_progress'
    ).length;
    const assigned = mockAssignments.filter(
      (a) => a.status === 'assigned'
    ).length;
    const overallProgress =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({ total, completed, inProgress, assigned, overallProgress });
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'assigned':
        return <Badge className="bg-gray-100 text-gray-800">Assigned</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profile_picture_url} alt={user?.name} />
            <AvatarFallback className="text-lg">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here&apos;s an overview of your dementia care planning journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
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
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <p className="text-xs text-muted-foreground">Of all documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Document Assignments
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">
                      {assignment.documentTitle}
                    </h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Assigned by {assignment.trainerName} on{' '}
                    {formatDate(assignment.assignedAt)}
                  </p>
                  {assignment.notes && (
                    <p className="text-sm text-gray-500">{assignment.notes}</p>
                  )}
                  {assignment.dueDate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
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
                        onClick={() => router.push('/dementia-tool-demo')}
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
                  You don&apos;t have any dementia tool documents assigned yet.
                  Your trainer will assign documents when they&apos;re ready for
                  you to complete.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/member/documents')}
            >
              <FileText className="h-6 w-6" />
              View All Documents
            </Button>
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
    </div>
  );
}
