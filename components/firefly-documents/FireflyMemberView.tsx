'use client';

import React, { useState, useEffect } from 'react';
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
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Calendar,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

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

export default function FireflyMemberView() {
  const [assignments, setAssignments] = useState<FireflyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
        const token =
          localStorage.getItem('authToken') ||
          sessionStorage.getItem('authToken');

        if (!token) {
          console.error('No authentication token found');
          setAssignments([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/member/firefly-assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const assignmentsData: FireflyAssignment[] = data.data || [];
          setAssignments(assignmentsData);
        } else {
          console.error('Failed to fetch firefly assignments');
          setAssignments([]);
        }
      } catch (error) {
        console.error('Error fetching firefly assignments:', error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My Firefly Documents</h1>
        <p className="text-muted-foreground">
          View and complete your assigned health care planning documents
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Welcome to Your Health Care Planning Journey
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                These documents help you communicate your values, goals, and
                wishes for health care, end-of-life care, and after-life
                decisions. Take your time to think through each question
                carefully.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    {assignment.document_title}
                  </CardTitle>
                  <CardDescription>
                    Assigned by {assignment.trainer_name} on{' '}
                    {formatDate(assignment.assigned_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(assignment.status)}
                  {assignment.due_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Due: {formatDate(assignment.due_date)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{assignment.progress}%</span>
                </div>
                <Progress
                  value={assignment.progress}
                  className={`w-full ${getProgressColor(assignment.progress)}`}
                />
              </div>

              {/* Notes */}
              {assignment.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Note from volunteer:</strong> {assignment.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {assignment.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Document completed successfully
                    </span>
                  )}
                  {assignment.status === 'in_progress' && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      Continue working on this document
                    </span>
                  )}
                  {assignment.status === 'assigned' && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <AlertCircle className="h-4 w-4" />
                      Ready to begin
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {assignment.status === 'completed' ? (
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Completed
                    </Button>
                  ) : (
                    <Link href={`/member/firefly-documents/${assignment.id}`}>
                      <Button size="sm">
                        {assignment.status === 'assigned' ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Start Document
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Continue
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Firefly Documents Assigned
            </h3>
            <p className="text-gray-500 mb-4">
              You don&apos;t have any Firefly Documents assigned yet. Your
              volunteer will assign documents when they&apos;re ready for you to
              complete.
            </p>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Available Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Take your time to think through each question carefully</p>
            <p>• Discuss your preferences with family members and loved ones</p>
            <p>
              • Contact your volunteer if you have questions about any section
            </p>
            <p>
              • You can save your progress and return to complete the document
              later
            </p>
            <p>
              • These documents will help guide your medical team and surrogate
              decision maker(s)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
