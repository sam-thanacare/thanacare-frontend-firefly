'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import DementiaValuesForm from '@/components/dementia-tool/DementiaValuesForm';
import { DementiaResponse } from '@/lib/services/dementiaToolService';
import { toast } from 'sonner';

interface AssignmentDetails {
  assignment: {
    id: string;
    status: string;
    assigned_at: string;
    due_date?: string;
    notes?: string;
  };
  document: {
    id: string;
    title: string;
    description: string;
    content: string;
  };
  trainer: {
    name: string;
  };
  family: {
    name: string;
  };
  response?: {
    id: string;
    responses: string;
    progress: number;
    section_progress?: string;
    last_saved_at?: string;
    auto_save_enabled?: boolean;
    started_at: string;
    completed_at?: string;
  };
}

export default function DocumentFillPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const assignmentId = params.assignmentId as string;

  useEffect(() => {
    const fetchAssignment = async () => {
      console.log('🔄 DocumentDetailPage: Starting to fetch assignment');
      console.log('🔑 DocumentDetailPage: Token exists:', !!token);
      console.log('🆔 DocumentDetailPage: Assignment ID:', assignmentId);

      if (!token || !assignmentId) {
        console.log('❌ DocumentDetailPage: Missing token or assignment ID');
        console.log(
          '❌ DocumentDetailPage: Token:',
          !!token,
          'Assignment ID:',
          assignmentId
        );
        return;
      }

      try {
        setIsLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        console.log('🌐 DocumentDetailPage: Backend URL:', backendUrl);
        console.log(
          '📡 DocumentDetailPage: Making API call to:',
          `${backendUrl}/api/dementia-tool/assignments/${assignmentId}`
        );
        console.log(
          '🔐 DocumentDetailPage: Using token (first 20 chars):',
          token.substring(0, 20) + '...'
        );

        const response = await fetch(
          `${backendUrl}/api/dementia-tool/assignments/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          '📊 DocumentDetailPage: API Response status:',
          response.status
        );
        console.log(
          '📊 DocumentDetailPage: API Response headers:',
          Object.fromEntries(response.headers.entries())
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log('📦 DocumentDetailPage: Raw API response:', responseData);

          const assignmentData = responseData.data || responseData;
          console.log(
            '📄 DocumentDetailPage: Assignment data:',
            assignmentData
          );

          setAssignment(assignmentData);
          console.log('✅ DocumentDetailPage: Successfully loaded assignment');
        } else {
          const errorText = await response.text();
          console.error('❌ DocumentDetailPage: Failed to fetch assignment');
          console.error(
            '❌ DocumentDetailPage: Response status:',
            response.status
          );
          console.error('❌ DocumentDetailPage: Response text:', errorText);
          toast.error('Failed to load document assignment');
          router.push('/member/documents');
        }
      } catch (error) {
        console.error(
          '❌ DocumentDetailPage: Error fetching assignment:',
          error
        );
        console.error('❌ DocumentDetailPage: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });
        toast.error('Error loading document assignment');
        router.push('/member/documents');
      } finally {
        console.log('🏁 DocumentDetailPage: Assignment fetching completed');
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [token, assignmentId, router]);

  const handleSave = async (response: DementiaResponse) => {
    try {
      // The DementiaValuesForm component handles the actual saving
      // This callback is called after successful save
      toast.success('Document saved successfully!');

      // Update the assignment state with new progress
      if (assignment) {
        setAssignment({
          ...assignment,
          response: {
            id: assignment.response?.id || response.id || '',
            ...assignment.response,
            progress: response.progress,
            responses: response.responses,
            section_progress: response.section_progress,
            last_saved_at: response.last_saved_at,
            auto_save_enabled: response.auto_save_enabled,
            started_at:
              assignment.response?.started_at || new Date().toISOString(),
            completed_at:
              response.progress === 100 ? new Date().toISOString() : undefined,
          },
          assignment: {
            ...assignment.assignment,
            status: response.progress === 100 ? 'completed' : 'in_progress',
          },
        });
      }
    } catch (error) {
      console.error('Error in save callback:', error);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Assignment Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The document assignment you&apos;re looking for could not be
              found.
            </p>
            <Button onClick={() => router.push('/member/documents')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/member/documents')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Documents</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {assignment?.document?.title || 'Loading...'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Assigned by {assignment?.trainer?.name || 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {assignment?.assignment?.status &&
                getStatusBadge(assignment.assignment.status)}
              {assignment?.response && (
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">Progress</div>
                  <div className="text-lg font-bold">
                    {assignment.response.progress}%
                  </div>
                  <Progress
                    value={assignment.response.progress}
                    className="w-24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assignment Details</span>
                {assignment?.assignment?.status === 'completed' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Volunteer:
                  </span>
                  <p className="font-medium">
                    {assignment?.trainer?.name || 'Loading...'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Family:
                  </span>
                  <p className="font-medium">
                    {assignment?.family?.name || 'Loading...'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Assigned:
                  </span>
                  <p className="font-medium">
                    {assignment?.assignment?.assigned_at
                      ? formatDate(assignment.assignment.assigned_at)
                      : 'Loading...'}
                  </p>
                </div>
                {assignment?.assignment?.due_date && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Due Date:
                    </span>
                    <p className="font-medium">
                      {formatDate(assignment.assignment.due_date)}
                    </p>
                  </div>
                )}
                {assignment?.response?.started_at && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Started:
                    </span>
                    <p className="font-medium">
                      {formatDate(assignment.response.started_at)}
                    </p>
                  </div>
                )}
                {assignment?.response?.completed_at && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Completed:
                    </span>
                    <p className="font-medium">
                      {formatDate(assignment.response.completed_at)}
                    </p>
                  </div>
                )}
              </div>
              {assignment?.assignment?.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <span className="font-medium text-muted-foreground">
                    Notes:
                  </span>
                  <p className="mt-1">{assignment.assignment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {assignment?.document?.title || 'Loading Document...'}
              </CardTitle>
              {assignment?.document?.description && (
                <p className="text-muted-foreground">
                  {assignment.document.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {assignment ? (
                <DementiaValuesForm
                  assignmentId={assignmentId}
                  initialData={assignment}
                  onSave={handleSave}
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
