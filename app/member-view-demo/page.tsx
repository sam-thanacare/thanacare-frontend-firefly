'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  User,
  ArrowLeft,
  Play,
} from 'lucide-react';
import Link from 'next/link';

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

export default function MemberViewDemo() {
  const [assignments] = useState<Assignment[]>([
    {
      id: '1',
      documentTitle: 'Dementia Values & Priorities Tool',
      status: 'in_progress',
      progress: 65,
      assignedAt: '2024-01-15',
      dueDate: '2024-02-15',
      notes:
        'Please take your time to think through each question carefully. Feel free to discuss with family members.',
      trainerName: 'Dr. Sarah Johnson',
    },
    {
      id: '2',
      documentTitle: 'Advance Healthcare Directive',
      status: 'assigned',
      progress: 0,
      assignedAt: '2024-01-20',
      dueDate: '2024-02-20',
      trainerName: 'Dr. Sarah Johnson',
    },
  ]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/guest">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Guest Page
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Play className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">My Dementia Tool Documents</h1>
          <p className="text-muted-foreground">
            View and complete your assigned dementia care planning documents
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Welcome to Your Care Planning Journey
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  These documents help you communicate your wishes and
                  preferences for future care. Take your time to think through
                  each question carefully.
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
                      <FileText className="h-5 w-5 text-blue-500" />
                      {assignment.documentTitle}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Assigned by {assignment.trainerName} on{' '}
                      {formatDate(assignment.assignedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(assignment.status)}
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
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
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Note from trainer:</strong> {assignment.notes}
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
                      <Link href="/dementia-tool-demo">
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

        {/* Help Information */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p>• Take your time to think through each question carefully</p>
              <p>
                • Discuss your preferences with family members and loved ones
              </p>
              <p>
                • Contact your trainer if you have questions about any section
              </p>
              <p>
                • You can save your progress and return to complete the document
                later
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ready to Get Started?
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                This demo shows you the member experience. Sign up to create
                your account and start receiving personalized care planning
                documents from your trainer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    <User className="mr-2 h-4 w-4" />
                    Sign In to Continue
                  </Button>
                </Link>
                <Link href="/guest">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Guest Page
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
