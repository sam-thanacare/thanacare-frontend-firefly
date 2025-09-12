'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, FileText, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { AssignmentDetailsModal } from '@/components/admin/AssignmentDetailsModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  version: string;
  is_active: boolean;
}

interface Assignment {
  id: string;
  document_id: string;
  member_id: string;
  trainer_id: string;
  family_id: string;
  assigned_by: string;
  status: string;
  due_date?: string;
  assigned_at: string;
  completed_at?: string;
  notes?: string;
  document: Document;
  member: User;
  trainer: User;
  family_name?: string;
}

interface AssignmentWithDetails {
  assignment: Assignment;
  document: Document;
  member: User;
  trainer: User;
  family_name?: string;
  response?: {
    id: string;
    progress: number;
    section_progress?: string;
    last_saved_at?: string;
    auto_save_enabled?: boolean;
    started_at: string;
    completed_at?: string;
  };
}

interface BackendAssignmentResponse {
  assignment: {
    id: string;
    document_id: string;
    member_id: string;
    trainer_id: string;
    family_id: string;
    assigned_by?: string;
    status: string;
    due_date?: string;
    assigned_at: string;
    completed_at?: string;
    notes?: string;
  };
  document: Document;
  member: User;
  trainer: User;
  family?: {
    name: string;
  };
  response?: {
    id: string;
    progress: number;
    section_progress?: string;
    last_saved_at?: string;
    auto_save_enabled?: boolean;
    started_at: string;
    completed_at?: string;
  };
}

export function AdminDocumentAssignmentPanel() {
  const { token } = useAppSelector((state) => state.auth);
  const [members, setMembers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<
    string | null
  >(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form state
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedMemberDisplay, setSelectedMemberDisplay] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedTrainerDisplay, setSelectedTrainerDisplay] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedDocumentDisplay, setSelectedDocumentDisplay] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const backendUrl =
    process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch members (only members)
      const membersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        const allUsers = membersData.data || [];
        const memberUsers = allUsers.filter(
          (user: User) => user.role === 'member'
        );
        console.log('Fetched members:', memberUsers);
        setMembers(memberUsers);
      }

      // Fetch trainers
      const trainersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (trainersResponse.ok) {
        const trainersData = await trainersResponse.json();
        const allUsers = trainersData.data || [];
        const trainerUsers = allUsers.filter(
          (user: User) => user.role === 'trainer'
        );
        console.log('Fetched trainers:', trainerUsers);
        setTrainers(trainerUsers);
      }

      // Fetch documents
      const documentsResponse = await fetch(
        `${backendUrl}/dementia-tool/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (documentsResponse.ok) {
        const documentData = await documentsResponse.json();
        console.log('Fetched documents:', documentData.data);
        setDocuments(documentData.data || []);
      }

      // Fetch all assignments (admin can see all)
      const assignmentsResponse = await fetch(
        `${backendUrl}/api/admin/dementia-assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignments = assignmentsData.data || [];

        // Transform the backend data structure to match frontend expectations
        const transformedAssignments = assignments.map(
          (item: BackendAssignmentResponse) => ({
            assignment: {
              id: item.assignment.id,
              document_id: item.assignment.document_id,
              member_id: item.assignment.member_id,
              trainer_id: item.assignment.trainer_id,
              family_id: item.assignment.family_id,
              assigned_by: item.assignment.assigned_by || '',
              status: item.assignment.status,
              due_date: item.assignment.due_date,
              assigned_at: item.assignment.assigned_at,
              completed_at: item.assignment.completed_at,
              notes: item.assignment.notes,
              document: item.document,
              member: item.member,
              trainer: item.trainer,
              family_name: item.family?.name,
            },
            document: item.document,
            member: item.member,
            trainer: item.trainer,
            family_name: item.family?.name,
            response: item.response,
          })
        );

        setAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
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

      let familyId = null;
      if (memberProfileResponse.ok) {
        const memberProfile = await memberProfileResponse.json();
        if (
          memberProfile.member_profile &&
          memberProfile.member_profile.family_id &&
          memberProfile.member_profile.family_id !==
            '00000000-0000-0000-0000-000000000000'
        ) {
          familyId = memberProfile.member_profile.family_id;
        }
      }

      const assignmentData = {
        document_id: selectedDocument,
        member_id: selectedMember,
        trainer_id: selectedTrainer,
        family_id: familyId,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
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
        await response.json();
        toast.success('Document assigned successfully');
        setIsAssignDialogOpen(false);
        resetForm();
        fetchData(); // Refresh the assignments list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign document');
      }
    } catch (error) {
      console.error('Error assigning document:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to assign document'
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMember(memberId);
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setSelectedMemberDisplay(`${member.name} (${member.email})`);
    } else {
      setSelectedMemberDisplay('');
    }
  };

  const handleTrainerSelection = (trainerId: string) => {
    setSelectedTrainer(trainerId);
    const trainer = trainers.find((t) => t.id === trainerId);
    if (trainer) {
      setSelectedTrainerDisplay(`${trainer.name} (${trainer.email})`);
    } else {
      setSelectedTrainerDisplay('');
    }
  };

  const handleDocumentSelection = (documentId: string) => {
    setSelectedDocument(documentId);
    const document = documents.find((d) => d.id === documentId);
    if (document) {
      setSelectedDocumentDisplay(`${document.title} (v${document.version})`);
    } else {
      setSelectedDocumentDisplay('');
    }
  };

  const resetForm = () => {
    console.log('Resetting form, current members:', members);
    console.log('Current trainers:', trainers);
    console.log('Current documents:', documents);
    setSelectedMember('');
    setSelectedMemberDisplay('');
    setSelectedTrainer('');
    setSelectedTrainerDisplay('');
    setSelectedDocument('');
    setSelectedDocumentDisplay('');
    setDueDate('');
    setNotes('');
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this assignment? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingAssignmentId(assignmentId);

      const response = await fetch(
        `${backendUrl}/api/dementia-tool/assignments/${assignmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Assignment deleted successfully');
        fetchData(); // Refresh the assignments list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete assignment'
      );
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  const handleRowClick = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setIsDetailsModalOpen(true);
  };

  const handleAssignmentDeleted = () => {
    fetchData(); // Refresh the assignments list
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'reviewed':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.document.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.trainer.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.family_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Document Assignments
          </h2>
          <p className="text-muted-foreground">
            Assign dementia tool documents to members and track their progress
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Assign Document to Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm font-medium">
                  Member *
                </Label>
                <Select
                  value={selectedMember}
                  onValueChange={handleMemberSelection}
                >
                  <SelectTrigger className="w-full">
                    <span className="block truncate">
                      {selectedMemberDisplay || 'Select a member'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.email}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainer" className="text-sm font-medium">
                  Managing Trainer *
                </Label>
                <Select
                  value={selectedTrainer}
                  onValueChange={handleTrainerSelection}
                >
                  <SelectTrigger className="w-full">
                    <span className="block truncate">
                      {selectedTrainerDisplay ||
                        'Select a trainer to manage this assignment'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{trainer.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {trainer.email}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The trainer will manage and monitor this assignment for the
                  member.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium">
                  Document *
                </Label>
                <Select
                  value={selectedDocument}
                  onValueChange={handleDocumentSelection}
                >
                  <SelectTrigger className="w-full">
                    <span className="block truncate">
                      {selectedDocumentDisplay || 'Select a document'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.title}</span>
                          <Badge variant="outline" className="text-xs">
                            v{doc.version}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-sm font-medium">
                  Due Date (Optional)
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this assignment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignDocument}
                  disabled={
                    assigning ||
                    !selectedMember ||
                    !selectedDocument ||
                    !selectedTrainer
                  }
                  className="w-full sm:w-auto"
                >
                  {assigning ? 'Assigning...' : 'Assign Document'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>All Assignments ({filteredAssignments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No assignments match your search criteria.'
                  : 'No documents have been assigned yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Your First Document
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow
                    key={assignment.assignment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(assignment)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.member.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.member.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.trainer.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.trainer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.document.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          v{assignment.document.version}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.family_name ? (
                        <Badge variant="outline">
                          {assignment.family_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No family</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(
                          assignment.assignment.status
                        )}
                      >
                        {assignment.assignment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{assignment.response?.progress || 0}%</span>
                        </div>
                        <Progress
                          value={assignment.response?.progress || 0}
                          className="w-20"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.assignment.due_date ? (
                        <div className="text-sm">
                          {new Date(
                            assignment.assignment.due_date
                          ).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No due date
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(
                          assignment.assignment.assigned_at
                        ).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(assignment.assignment.id);
                          }}
                          disabled={
                            deletingAssignmentId === assignment.assignment.id
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingAssignmentId === assignment.assignment.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Details Modal */}
      <AssignmentDetailsModal
        assignment={
          selectedAssignment
            ? {
                id: selectedAssignment.assignment.id,
                document_id: selectedAssignment.assignment.document_id,
                member_id: selectedAssignment.assignment.member_id,
                trainer_id: selectedAssignment.assignment.trainer_id,
                family_id: selectedAssignment.assignment.family_id,
                status: selectedAssignment.assignment.status,
                due_date: selectedAssignment.assignment.due_date,
                assigned_at: selectedAssignment.assignment.assigned_at,
                notes: selectedAssignment.assignment.notes,
                member: {
                  ...selectedAssignment.member,
                  role: selectedAssignment.member.role as
                    | 'admin'
                    | 'trainer'
                    | 'member',
                },
                document: selectedAssignment.document,
                trainer: {
                  ...selectedAssignment.trainer,
                  role: selectedAssignment.trainer.role as
                    | 'admin'
                    | 'trainer'
                    | 'member',
                },
                family: {
                  id: selectedAssignment.assignment.family_id,
                  name: selectedAssignment.family_name || 'No family',
                  organization_id: '',
                  created_by: '',
                  created_at: '',
                },
              }
            : null
        }
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onAssignmentDeleted={handleAssignmentDeleted}
      />
    </div>
  );
}
