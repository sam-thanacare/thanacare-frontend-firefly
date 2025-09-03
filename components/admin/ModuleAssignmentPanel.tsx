'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { AssignmentDetailsModal } from './AssignmentDetailsModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'member';
}

interface DementiaDocument {
  id: string;
  title: string;
  description: string;
  version: string;
}

interface Assignment {
  id: string;
  document_id: string;
  member_id: string;
  trainer_id: string;
  family_id: string;
  status: string;
  due_date?: string;
  assigned_at: string;
  notes?: string;
  member: User;
  document: DementiaDocument;
  trainer: User;
  family: {
    id: string;
    name: string;
    organization_id: string;
    created_by: string;
    created_at: string;
  };
}

interface BackendAssignmentResponse {
  assignment: {
    id: string;
    document_id: string;
    member_id: string;
    trainer_id: string;
    family_id: string;
    status: string;
    due_date?: string;
    assigned_at: string;
    notes?: string;
  };
  member: User;
  document: DementiaDocument;
  trainer: User;
  family: {
    id: string;
    name: string;
    organization_id: string;
    created_by: string;
    created_at: string;
  };
}

export function ModuleAssignmentPanel() {
  const { token } = useAppSelector((state) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<DementiaDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Form state
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

  // Fetch users, documents, and existing assignments
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // Fetch documents - try to get the default document
      const documentsResponse = await fetch(
        `${backendUrl}/dementia-tool/document`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (documentsResponse.ok) {
        const documentData = await documentsResponse.json();
        // Handle the new APIResponse structure with data property
        const document = documentData.data || documentData;
        setDocuments([
          {
            id: document.id || 'default',
            title: document.title || 'Dementia Values & Priorities Tool',
            description:
              document.description ||
              'Comprehensive dementia care planning document',
            version: document.version || '1.0',
          },
        ]);
      } else {
        // Fallback to default document if the endpoint fails
        setDocuments([
          {
            id: 'default',
            title: 'Dementia Values & Priorities Tool',
            description: 'Comprehensive dementia care planning document',
            version: '1.0',
          },
        ]);
      }

      // Fetch existing assignments using the new admin endpoint
      const assignmentsResponse = await fetch(
        `${backendUrl}/api/admin/dementia-assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        // Handle the new APIResponse structure with data property
        const assignments = assignmentsData.data || [];
        // Transform the backend data structure to match frontend expectations
        const transformedAssignments = assignments.map(
          (item: BackendAssignmentResponse) => ({
            id: item.assignment.id,
            document_id: item.assignment.document_id,
            member_id: item.assignment.member_id,
            trainer_id: item.assignment.trainer_id,
            family_id: item.assignment.family_id,
            status: item.assignment.status,
            due_date: item.assignment.due_date,
            assigned_at: item.assignment.assigned_at,
            notes: item.assignment.notes,
            member: item.member,
            document: item.document,
            trainer: item.trainer,
            family: item.family,
          })
        );
        setAssignments(transformedAssignments || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignDocument = async () => {
    if (!selectedMember || !selectedDocument || !selectedTrainer) {
      toast.error(
        'Please fill in all required fields (Member, Document, and Managing Trainer).'
      );
      return;
    }

    // Additional validation to ensure we're only assigning to members
    const selectedUser = validMemberUsers.find(
      (user) => user.id === selectedMember
    );
    if (!selectedUser || selectedUser.role !== 'member') {
      toast.error('Documents can only be assigned to members.');
      return;
    }

    try {
      setAssigning(true);

      // Get member profile to get family_id
      const memberProfileResponse = await fetch(
        `${backendUrl}/api/admin/user-profile?user_id=${selectedMember}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let familyId = '';
      if (memberProfileResponse.ok) {
        const memberProfile = await memberProfileResponse.json();
        if (
          memberProfile.member_profile &&
          memberProfile.member_profile.family_id
        ) {
          familyId = memberProfile.member_profile.family_id;
        }
      }

      const assignmentData = {
        document_id: selectedDocument,
        member_id: selectedMember,
        trainer_id: selectedTrainer,
        family_id: familyId,
        due_date: dueDate || null,
        notes: notes || null,
      };

      const response = await fetch(
        `${backendUrl}/api/dementia-tool/assignments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignmentData),
        }
      );

      if (response.ok) {
        const newAssignment = await response.json();

        // After creating the assignment, we need to fetch the full details
        // since the creation endpoint only returns basic assignment data
        try {
          const fullAssignmentResponse = await fetch(
            `${backendUrl}/api/admin/dementia-assignments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (fullAssignmentResponse.ok) {
            const allAssignmentsData = await fullAssignmentResponse.json();
            // Handle the new APIResponse structure with data property
            const allAssignments = allAssignmentsData.data || [];
            // Find the newly created assignment and transform it
            const newFullAssignment = allAssignments.find(
              (item: BackendAssignmentResponse) =>
                item.assignment.id === newAssignment.id
            );

            if (newFullAssignment) {
              const transformedAssignment = {
                id: newFullAssignment.assignment.id,
                document_id: newFullAssignment.assignment.document_id,
                member_id: newFullAssignment.assignment.member_id,
                trainer_id: newFullAssignment.assignment.trainer_id,
                family_id: newFullAssignment.assignment.family_id,
                status: newFullAssignment.assignment.status,
                due_date: newFullAssignment.assignment.due_date,
                assigned_at: newFullAssignment.assignment.assigned_at,
                notes: newFullAssignment.assignment.notes,
                member: newFullAssignment.member,
                document: newFullAssignment.document,
                trainer: newFullAssignment.trainer,
                family: newFullAssignment.family,
              };
              setAssignments((prev) => [...prev, transformedAssignment]);
            } else {
              // Fallback: add the basic assignment and refresh the list
              setAssignments((prev) => [...prev, newAssignment]);
              // Refresh the entire list to get the full details
              fetchData();
            }
          } else {
            // Fallback: add the basic assignment
            setAssignments((prev) => [...prev, newAssignment]);
          }
        } catch (error) {
          console.error('Error fetching full assignment details:', error);
          // Fallback: add the basic assignment
          setAssignments((prev) => [...prev, newAssignment]);
        }

        // Reset form
        setSelectedMember('');
        setSelectedDocument('');
        setSelectedTrainer('');
        setDueDate('');
        setNotes('');

        toast.success('Document assigned successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign document');
      }
    } catch (error) {
      console.error('Error assigning document:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to assign document. Please try again.'
      );
    } finally {
      setAssigning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            In Progress
          </Badge>
        );
      case 'assigned':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Assigned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentDeleted = () => {
    // Remove the deleted assignment from the list
    if (selectedAssignment) {
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== selectedAssignment.id)
      );
    }
  };

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter((assignment) => {
    // Add null checks to prevent errors when accessing properties
    if (!assignment.member || !assignment.document) {
      return false; // Skip assignments with missing data
    }

    const matchesSearch =
      assignment.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.member.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.document.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || assignment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Filter users by role - ensure only members can be assigned documents
  const memberUsers = users.filter((user) => user.role === 'member') || [];
  const trainerUsers = users.filter((user) => user.role === 'trainer') || [];

  // Additional validation to ensure we only have members for assignment
  const validMemberUsers = memberUsers.filter((user) => {
    // Double-check that the user is actually a member
    return user.role === 'member' && user.id && user.name;
  });

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Assign Dementia Tool Document</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign dementia values and priorities documents to members only. A
            trainer must be selected to manage and monitor the assignment.
            Trainers and admins cannot be assigned documents.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show message if no users or documents are available */}
          {(validMemberUsers.length === 0 ||
            trainerUsers.length === 0 ||
            documents.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Setup Required
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {validMemberUsers.length === 0 &&
                      'No members available for document assignment. '}
                    {trainerUsers.length === 0 &&
                      'No trainers available to manage assignments. '}
                    {documents.length === 0 && 'No documents available. '}
                    Please create members, trainers, and documents before
                    assigning dementia tool documents. Note: Documents can only
                    be assigned to members.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="member">Member *</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {validMemberUsers.length > 0 ? (
                    validMemberUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.email}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No members available for assignment
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer">Managing Trainer *</Label>
              <Select
                value={selectedTrainer}
                onValueChange={setSelectedTrainer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trainer to manage this assignment" />
                </SelectTrigger>
                <SelectContent>
                  {trainerUsers.length > 0 ? (
                    trainerUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.email}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No trainers available
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The trainer will manage and monitor this assignment for the
                member.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Document *</Label>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.title}</span>
                          <Badge variant="outline" className="text-xs">
                            v{doc.version}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No documents available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handleAssignDocument}
              disabled={
                assigning ||
                !selectedMember ||
                !selectedDocument ||
                !selectedTrainer ||
                validMemberUsers.length === 0 ||
                trainerUsers.length === 0 ||
                documents.length === 0
              }
              className="min-w-[150px]"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : validMemberUsers.length === 0 ||
                trainerUsers.length === 0 ||
                documents.length === 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Setup Required
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Current Assignments</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View and manage all dementia tool document assignments
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No assignments found</p>
              <p className="text-sm">
                {assignments.length === 0
                  ? 'Create your first assignment above to get started.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(assignment.status)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-lg">
                              {assignment.member?.name || 'Unknown Member'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.member?.email || 'No email'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Document:</span>{' '}
                            {assignment.document?.title || 'Unknown Document'}
                          </div>
                          {assignment.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span>{' '}
                              {assignment.notes}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Assigned:{' '}
                                {new Date(
                                  assignment.assigned_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {assignment.due_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due:{' '}
                                  {new Date(
                                    assignment.due_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(assignment.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(assignment)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter((a) => a.status === 'assigned').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter((a) => a.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Active work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter((a) => a.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Details Modal */}
      <AssignmentDetailsModal
        assignment={selectedAssignment}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onAssignmentDeleted={handleAssignmentDeleted}
      />
    </div>
  );
}
