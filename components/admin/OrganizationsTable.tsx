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
import { Plus, Building2, Edit, Trash2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Organization {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface CreateOrganizationRequest {
  name: string;
}

interface UpdateOrganizationRequest {
  name: string;
}

interface RawOrganization {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function OrganizationsTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

  // Fetch organizations
  const fetchOrganizations = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Organizations response:', data);

        // Ensure we have valid data and add defensive checks
        const orgs = data.data || [];
        const validatedOrgs = orgs.map((org: RawOrganization) => {
          // Ensure creator object exists and has required properties
          if (!org.creator) {
            console.warn('Organization missing creator:', org);
            org.creator = {
              id: 'unknown',
              name: 'Unknown Creator',
              email: 'unknown@example.com',
              role: 'unknown',
            };
          } else if (
            !org.creator.name ||
            !org.creator.email ||
            !org.creator.role
          ) {
            console.warn(
              'Organization creator missing properties:',
              org.creator
            );
            org.creator = {
              id: org.creator.id || 'unknown',
              name: org.creator.name || 'Unknown Creator',
              email: org.creator.email || 'unknown@example.com',
              role: org.creator.role || 'unknown',
            };
          }

          return org;
        });

        console.log('Validated organizations:', validatedOrgs);
        setOrganizations(validatedOrgs);
      } else {
        console.error('Failed to fetch organizations');
        setAlert({ type: 'error', message: 'Failed to fetch organizations' });
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setAlert({ type: 'error', message: 'Error fetching organizations' });
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Create organization
  const handleCreateOrganization = async () => {
    if (!token || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${backendUrl}/api/organizations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
        } as CreateOrganizationRequest),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations((prev) => [data.data, ...prev]);
        setFormData({ name: '' });
        setCreateDialogOpen(false);
        setAlert({
          type: 'success',
          message: 'Organization created successfully',
        });
      } else {
        const errorData = await response.json();
        setAlert({
          type: 'error',
          message: errorData.error || 'Failed to create organization',
        });
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setAlert({ type: 'error', message: 'Error creating organization' });
    } finally {
      setSubmitting(false);
    }
  };

  // Update organization
  const handleUpdateOrganization = async () => {
    if (!token || !selectedOrg || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${backendUrl}/api/organizations/${selectedOrg.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
          } as UpdateOrganizationRequest),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrganizations((prev) =>
          prev.map((org) => (org.id === selectedOrg.id ? data.data : org))
        );
        setFormData({ name: '' });
        setEditDialogOpen(false);
        setSelectedOrg(null);
        setAlert({
          type: 'success',
          message: 'Organization updated successfully',
        });
      } else {
        const errorData = await response.json();
        setAlert({
          type: 'error',
          message: errorData.error || 'Failed to update organization',
        });
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setAlert({ type: 'error', message: 'Error updating organization' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete organization
  const handleDeleteOrganization = async () => {
    if (!token || !selectedOrg) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${backendUrl}/api/organizations/${selectedOrg.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setOrganizations((prev) =>
          prev.filter((org) => org.id !== selectedOrg.id)
        );
        setDeleteDialogOpen(false);
        setSelectedOrg(null);
        setAlert({
          type: 'success',
          message: 'Organization deleted successfully',
        });
      } else {
        const errorData = await response.json();
        setAlert({
          type: 'error',
          message: errorData.error || 'Failed to delete organization',
        });
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      setAlert({ type: 'error', message: 'Error deleting organization' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle copy ID
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setAlert({
        type: 'success',
        message: 'Organization ID copied to clipboard',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
      setAlert({ type: 'error', message: 'Failed to copy ID' });
    }
  };

  // Open edit dialog
  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({ name: org.name });
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '' });
    setSelectedOrg(null);
  };

  // Clear alert
  const clearAlert = () => {
    setAlert(null);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown Date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Messages */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription className="flex items-center justify-between">
            <span>{alert.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAlert}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Organizations</h3>
          <p className="text-sm text-muted-foreground">
            Manage all organizations in the system
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization. The organization ID will be generated
                automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter organization name"
                  className="mt-1"
                />
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
                onClick={handleCreateOrganization}
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading organizations...
              </p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No organizations found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first organization to get started.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization ID</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      {org.name || 'Unnamed Organization'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {org.id || 'No ID'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyId(org.id)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === org.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {org.creator?.name || 'Unknown Creator'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {org.creator?.role || 'Unknown'} •{' '}
                          {org.creator?.email || 'unknown@example.com'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.created_at
                        ? formatDate(org.created_at)
                        : 'Unknown Date'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(org)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(org)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the organization name. The organization ID cannot be
              changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-org-name">Organization Name</Label>
              <Input
                id="edit-org-name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter organization name"
                className="mt-1"
              />
            </div>
            {selectedOrg && (
              <div>
                <Label>Organization ID</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm flex-1">
                    {selectedOrg.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyId(selectedOrg.id)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === selectedOrg.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
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
              onClick={handleUpdateOrganization}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? 'Updating...' : 'Update Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedOrg?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                <strong>Warning:</strong> Deleting an organization will remove
                all associated data including:
              </p>
              <ul className="text-sm text-destructive mt-2 ml-4 list-disc">
                <li>Volunteer profiles</li>
                <li>Families</li>
                <li>Member profiles</li>
                <li>All related data</li>
              </ul>
            </div>
          </div>
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
              onClick={handleDeleteOrganization}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
