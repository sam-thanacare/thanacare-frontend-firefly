'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Mail,
  Building,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface AssignmentDetailsModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentDeleted: () => void;
}

export function AssignmentDetailsModal({
  assignment,
  isOpen,
  onClose,
  onAssignmentDeleted,
}: AssignmentDetailsModalProps) {
  const { token } = useAppSelector((state) => state.auth);
  const [isDeleting, setIsDeleting] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

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

  const handleDeleteAssignment = async () => {
    if (!assignment || !token) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `${backendUrl}/api/dementia-tool/assignments/${assignment.id}`,
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
        onAssignmentDeleted();
        onClose();
      } else {
        let errorMessage = 'Failed to delete assignment';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text or a generic message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete assignment. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(assignment.status)}
            <span>Assignment Details</span>
          </DialogTitle>
          <DialogDescription>
            View and manage assignment details for {assignment.member?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(assignment.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {/* Member Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Member Details</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {assignment.member?.name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{assignment.member?.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{assignment.member?.email}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Role:</span>{' '}
                  <Badge variant="outline" className="ml-1">
                    {assignment.member?.role}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Member ID:</span>{' '}
                  <span className="text-muted-foreground">
                    {assignment.member?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Document Assignment Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Document Assignment Details</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="font-medium">{assignment.document?.title}</div>
                <div className="text-sm text-muted-foreground">
                  {assignment.document?.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span>{' '}
                  <Badge variant="outline" className="ml-1">
                    v{assignment.document?.version}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Document ID:</span>{' '}
                  <span className="text-muted-foreground">
                    {assignment.document?.id}
                  </span>
                </div>
              </div>
              {assignment.due_date && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Due Date:</span>
                  <span>
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {assignment.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <div className="mt-1 p-2 bg-white rounded border">
                    {assignment.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Managing Trainer Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Managing Volunteer Details</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {assignment.trainer?.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{assignment.trainer?.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{assignment.trainer?.email}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Role:</span>{' '}
                  <Badge variant="outline" className="ml-1">
                    {assignment.trainer?.role}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Volunteer ID:</span>{' '}
                  <span className="text-muted-foreground">
                    {assignment.trainer?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Family Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Family Information</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="text-sm">
                <div>
                  <span className="font-medium">Family Name:</span>{' '}
                  <span>{assignment.family?.name}</span>
                </div>
                <div>
                  <span className="font-medium">Family ID:</span>{' '}
                  <span className="text-muted-foreground">
                    {assignment.family?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDeleteAssignment}
            disabled={isDeleting}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Deleting...' : 'Remove Assignment'}</span>
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
