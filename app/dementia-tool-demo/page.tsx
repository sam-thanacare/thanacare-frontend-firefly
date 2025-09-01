'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, AlertCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  dementiaToolService,
  DementiaAssignmentWithDetails,
} from '@/lib/services/dementiaToolService';
import DementiaValuesForm from '@/components/dementia-tool/DementiaValuesForm';
import { toast } from 'sonner';

export default function DementiaToolDemoPage() {
  const { user, isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState<
    DementiaAssignmentWithDetails[]
  >([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<DementiaAssignmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user?.role === 'trainer' || user?.role === 'admin') {
        // For trainers/admins, get assignments they created
        const data = await dementiaToolService.getAssignmentsByTrainer(user.id);
        setAssignments(data);
      } else if (user?.role === 'member') {
        // For members, get their assignments
        const data = await dementiaToolService.getAssignmentsByMember(user.id);
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAssignments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadAssignments]);

  const handleAssignmentSelect = (
    assignment: DementiaAssignmentWithDetails
  ) => {
    setSelectedAssignment(assignment);
  };

  const handleBackToList = () => {
    setSelectedAssignment(null);
  };

  const handleSaveResponse = () => {
    // Refresh assignments to show updated progress
    loadAssignments();
    toast.success('Response saved successfully!');
  };

  const handleGeneratePDF = async (assignmentId: string) => {
    try {
      const pdfBlob = await dementiaToolService.generatePDF(assignmentId);
      dementiaToolService.downloadPDF(
        pdfBlob,
        `dementia-tool-${assignmentId}.pdf`
      );
      toast.success('PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateAssignmentsPDF = async () => {
    if (!user) return;

    try {
      const pdfBlob = await dementiaToolService.generateAssignmentsPDF(user.id);
      dementiaToolService.downloadPDF(
        pdfBlob,
        `assignments-report-${user.id}.pdf`
      );
      toast.success(
        'Assignments report generated and downloaded successfully!'
      );
    } catch (error) {
      console.error('Failed to generate assignments PDF:', error);
      toast.error('Failed to generate assignments PDF. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to access the Dementia Values & Priorities Tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This tool requires authentication to ensure your responses are
              securely saved and associated with your account.
            </p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button onClick={handleBackToList} variant="outline" className="mb-4">
            ← Back to Assignments
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {selectedAssignment.document.title}
              </CardTitle>
              <CardDescription>
                Assignment for {selectedAssignment.member.name} in{' '}
                {selectedAssignment.family.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge
                    className={`ml-2 ${getStatusColor(selectedAssignment.assignment.status)}`}
                  >
                    {selectedAssignment.assignment.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Progress:</span>
                  <span
                    className={`ml-2 ${getProgressColor(selectedAssignment.response?.progress || 0)}`}
                  >
                    {selectedAssignment.response?.progress || 0}%
                  </span>
                </div>
                <div>
                  <span className="font-medium">Assigned:</span>
                  <span className="ml-2">
                    {new Date(
                      selectedAssignment.assignment.assigned_at
                    ).toLocaleDateString()}
                  </span>
                </div>
                {selectedAssignment.assignment.due_date && (
                  <div>
                    <span className="font-medium">Due Date:</span>
                    <span className="ml-2">
                      {new Date(
                        selectedAssignment.assignment.due_date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedAssignment.response &&
                selectedAssignment.response.progress === 100 && (
                  <div className="mt-4">
                    <Button
                      onClick={() =>
                        handleGeneratePDF(selectedAssignment.assignment.id)
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Completed Form as PDF
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        <DementiaValuesForm
          assignmentId={selectedAssignment.assignment.id}
          initialData={selectedAssignment.response}
          onSave={handleSaveResponse}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">
          Dementia Values & Priorities Tool
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.name}! Here are your dementia tool assignments and
          progress.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin mr-2" />
              Loading assignments...
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      ) : assignments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              No Assignments Found
            </CardTitle>
            <CardDescription>
              You don&apos;t have any dementia tool assignments yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {user?.role === 'trainer' || user?.role === 'admin'
                ? 'Assign dementia tool documents to members to get started.'
                : 'Your trainer will assign dementia tool documents to you when they&apos;re ready.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total Assignments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {
                    assignments.filter(
                      (a) => a.assignment.status === 'completed'
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    assignments.filter(
                      (a) => a.assignment.status === 'in_progress'
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Assignments</CardTitle>
                  <CardDescription>
                    {user?.role === 'trainer' || user?.role === 'admin'
                      ? 'Dementia tool assignments you&apos;ve created for members'
                      : 'Your assigned dementia tool documents'}
                  </CardDescription>
                </div>
                {(user?.role === 'trainer' || user?.role === 'admin') &&
                  assignments.length > 0 && (
                    <Button
                      onClick={handleGenerateAssignmentsPDF}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.assignment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAssignmentSelect(assignment)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {user?.role === 'member'
                              ? assignment.document.title
                              : `${assignment.member.name} - ${assignment.document.title}`}
                          </h3>
                          <Badge
                            className={getStatusColor(
                              assignment.assignment.status
                            )}
                          >
                            {assignment.assignment.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          {user?.role === 'member' ? (
                            <>
                              <p>Assigned by: {assignment.trainer.name}</p>
                              <p>Family: {assignment.family.name}</p>
                            </>
                          ) : (
                            <>
                              <p>Member: {assignment.member.name}</p>
                              <p>Family: {assignment.family.name}</p>
                            </>
                          )}
                          <p>
                            Assigned:{' '}
                            {new Date(
                              assignment.assignment.assigned_at
                            ).toLocaleDateString()}
                          </p>
                          {assignment.assignment.due_date && (
                            <p>
                              Due:{' '}
                              {new Date(
                                assignment.assignment.due_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getProgressColor(assignment.response?.progress || 0)}`}
                        >
                          {assignment.response?.progress || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Progress
                        </div>
                      </div>
                    </div>

                    {assignment.assignment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Notes:</span>{' '}
                        {assignment.assignment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
