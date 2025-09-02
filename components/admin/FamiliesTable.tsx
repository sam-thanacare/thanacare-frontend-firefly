'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users2, Edit, Trash2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Family {
  id: string;
  name: string;
  organization_id: string;
  created_by: string;
  created_at: string;
}

interface CreateFamilyRequest {
  name: string;
  organization_id: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  name: string;
  role: string;
}

export function FamiliesTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [families, setFamilies] = useState<Family[]>([]);
  const [organizations, setOrganizations] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState<CreateFamilyRequest>({
    name: '',
    organization_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

  // Fetch families
  const fetchFamilies = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/families`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch families');
      }

      const responseData = await response.json();
      const data = responseData.data || [];
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
      setAlert({
        type: 'error',
        message: 'Failed to fetch families. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  // Fetch organizations for the dropdown
  const fetchOrganizations = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${backendUrl}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const responseData = await response.json();
      const data: OrganizationResponse[] = responseData.data || [];
      setOrganizations(data.map((org) => ({ id: org.id, name: org.name })));
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  }, [token, backendUrl]);

  // Fetch users for creator information
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UserResponse[] = await response.json();
      setUsers(
        data.map((user) => ({
          id: user.id,
          name: user.name,
          role: user.role,
        }))
      );
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchFamilies();
    fetchOrganizations();
    fetchUsers();
  }, [fetchFamilies, fetchOrganizations, fetchUsers]);

  const resetForm = () => {
    setFormData({ name: '', organization_id: '' });
    setSelectedFamily(null);
  };

  // Helper functions to get names from IDs
  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : 'Unknown Organization';
  };

  const getCreatorName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getCreatorRole = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.role : 'unknown';
  };

  const handleCreateFamily = async () => {
    if (!token) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${backendUrl}/api/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create family');
      }

      setAlert({
        type: 'success',
        message: 'Family created successfully!',
      });
      setCreateDialogOpen(false);
      resetForm();
      fetchFamilies();
    } catch (error) {
      console.error('Error creating family:', error);
      setAlert({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to create family',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFamily = async () => {
    if (!token || !selectedFamily) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${backendUrl}/api/families/${selectedFamily.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update family');
      }

      setAlert({
        type: 'success',
        message: 'Family updated successfully!',
      });
      setEditDialogOpen(false);
      resetForm();
      fetchFamilies();
    } catch (error) {
      console.error('Error updating family:', error);
      setAlert({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to update family',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (!token || !selectedFamily) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${backendUrl}/api/families/${selectedFamily.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete family');
      }

      setAlert({
        type: 'success',
        message: 'Family deleted successfully!',
      });
      setDeleteDialogOpen(false);
      resetForm();
      fetchFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
      setAlert({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to delete family',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const openEditDialog = (family: Family) => {
    setSelectedFamily(family);
    setFormData({ name: family.name, organization_id: family.organization_id });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (family: Family) => {
    setSelectedFamily(family);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading families...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Families</h3>
          <p className="text-sm text-muted-foreground">
            Manage all families in the system
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Family
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Family</DialogTitle>
              <DialogDescription>
                Create a new family. The family ID will be generated
                automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="family-name">Family Name</Label>
                <Input
                  id="family-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter family name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, organization_id: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFamily}
                disabled={
                  submitting ||
                  !formData.name.trim() ||
                  !formData.organization_id
                }
              >
                {submitting ? 'Creating...' : 'Create Family'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Families Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Family ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No families found. Create your first family to get started.
                  </TableCell>
                </TableRow>
              ) : (
                families.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell className="font-medium">{family.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getOrganizationName(family.organization_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                        <span>{getCreatorName(family.created_by)}</span>
                        <Badge variant="outline" className="text-xs">
                          {getCreatorRole(family.created_by)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(family.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {family.id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(family.id)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === family.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(family)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(family)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Family</DialogTitle>
            <DialogDescription>
              Update the family information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-family-name">Family Name</Label>
              <Input
                id="edit-family-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter family name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFamily}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? 'Updating...' : 'Update Family'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Family</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedFamily?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFamily}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Family'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
