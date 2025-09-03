'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Search,
  ArrowLeft,
  Heart,
  LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';

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

export default function MemberDocumentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('assignedAt');

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      const currentToken = token;
      if (!currentToken) return;

      try {
        setIsLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        const response = await fetch(`${backendUrl}/api/member/assignments`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const assignmentsData = data.data || data;

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
          setFilteredAssignments(transformedAssignments);
        } else {
          console.error('Failed to fetch assignments');
          setAssignments([]);
          setFilteredAssignments([]);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
        setFilteredAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  // Filter and sort assignments
  useEffect(() => {
    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.documentTitle
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.trainerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.familyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (assignment) => assignment.status === statusFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'assignedAt':
          return (
            new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
          );
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'title':
          return a.documentTitle.localeCompare(b.documentTitle);
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter, sortBy]);

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

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
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
                onClick={() => router.push('/member')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">My Documents</h1>
                  <p className="text-xs text-muted-foreground">
                    View and manage your assigned documents
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="hidden sm:flex items-center space-x-1 px-2 py-1"
              >
                <Heart className="h-3 w-3" />
                <span className="text-xs font-medium">Family Member</span>
              </Badge>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.profile_picture_url || undefined}
                    alt={user?.name || 'Profile'}
                  />
                  <AvatarFallback className="text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'M'}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{assignments.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
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
                    <p className="text-sm font-medium text-gray-600">
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
                    <p className="text-sm font-medium text-gray-600">
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

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>
                Find specific documents or filter by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search Documents</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by title, trainer, or family..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sort-by">Sort By</Label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="assignedAt">Date Assigned</option>
                    <option value="dueDate">Due Date</option>
                    <option value="progress">Progress</option>
                    <option value="title">Document Title</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Document Assignments</CardTitle>
              <CardDescription>
                {filteredAssignments.length} of {assignments.length} documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {assignment.documentTitle}
                            </h3>
                            {getStatusBadge(assignment.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Trainer:</span>{' '}
                              {assignment.trainerName}
                            </div>
                            {assignment.familyName && (
                              <div>
                                <span className="font-medium">Family:</span>{' '}
                                {assignment.familyName}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Assigned:</span>{' '}
                              {formatDate(assignment.assignedAt)}
                            </div>
                            {assignment.dueDate && (
                              <div>
                                <span className="font-medium">Due:</span>{' '}
                                {formatDate(assignment.dueDate)}
                              </div>
                            )}
                          </div>

                          {assignment.notes && (
                            <div className="bg-gray-50 p-3 rounded-md mt-3">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Note:</span>{' '}
                                {assignment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 ml-6">
                      <div className="text-right">
                        <div className="text-sm font-medium mb-1">Progress</div>
                        <div className="text-lg font-bold">
                          {assignment.progress}%
                        </div>
                        <Progress
                          value={assignment.progress}
                          className="w-24"
                        />
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

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No documents found'
                        : 'No Documents Assigned'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : "You don't have any dementia tool documents assigned yet. Your trainer will assign documents when they're ready for you to complete."}
                    </p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
