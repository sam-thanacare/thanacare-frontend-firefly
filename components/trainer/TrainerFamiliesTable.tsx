'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Plus, Edit, Trash2, Search, Copy, Check, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  created_at: string;
}

interface Family {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

interface OrganizationResponse {
  id: string;
  name: string;
  created_at: string;
}

interface FamilyResponse {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function TrainerFamiliesTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [families, setFamilies] = useState<Family[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFamilyDetailsOpen, setIsFamilyDetailsOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [copiedUUID, setCopiedUUID] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
  });

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
      const data: FamilyResponse[] = responseData.data || [];

      // Fetch member count for each family
      const familiesWithMemberCount = await Promise.all(
        data.map(async (family) => {
          try {
            const membersResponse = await fetch(
              `${backendUrl}/api/families/${family.id}/members`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              const members = membersData.data || [];
              return { ...family, member_count: members.length };
            }
            return { ...family, member_count: 0 };
          } catch (error) {
            console.error(
              `Error fetching members for family ${family.id}:`,
              error
            );
            return { ...family, member_count: 0 };
          }
        })
      );

      setFamilies(familiesWithMemberCount);
    } catch (error) {
      console.error('Error fetching families:', error);
      toast.error('Failed to fetch families');
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
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchFamilies();
    fetchOrganizations();
  }, [fetchFamilies, fetchOrganizations]);

  const resetForm = () => {
    setFormData({ name: '', organization_id: '' });
    setSelectedFamily(null);
  };

  // Helper function to get organization name from ID
  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : 'Unknown Organization';
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
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

      toast.success('Family created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchFamilies();
    } catch (error) {
      console.error('Error creating family:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create family'
      );
    }
  };

  const handleEditFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedFamily) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/families/${selectedFamily.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update family');
      }

      toast.success('Family updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchFamilies();
    } catch (error) {
      console.error('Error updating family:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update family'
      );
    }
  };

  const handleDeleteFamily = async (
    familyId: string,
    familyName: string,
    memberCount: number = 0
  ) => {
    if (!token) return;

    // Check if family has members
    if (memberCount > 0) {
      toast.error(
        `Cannot delete family "${familyName}" because it has ${memberCount} active member(s). Please remove all members first.`
      );
      return;
    }

    if (
      !confirm(`Are you sure you want to delete the family "${familyName}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/families/${familyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete family');
      }

      toast.success('Family deleted successfully');
      fetchFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete family'
      );
    }
  };

  const openEditDialog = (family: Family) => {
    setSelectedFamily(family);
    setFormData({
      name: family.name,
      organization_id: family.organization_id,
    });
    setIsEditDialogOpen(true);
  };

  // Fetch family members
  const fetchFamilyMembers = useCallback(
    async (familyId: string) => {
      if (!token) return;

      try {
        setLoadingMembers(true);
        const response = await fetch(
          `${backendUrl}/api/families/${familyId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch family members');
        }

        const responseData = await response.json();
        const members: FamilyMember[] = responseData.data || [];
        setFamilyMembers(members);
      } catch (error) {
        console.error('Error fetching family members:', error);
        toast.error('Failed to fetch family members');
        setFamilyMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    },
    [token, backendUrl]
  );

  // Handle family row click
  const handleFamilyRowClick = (family: Family) => {
    setSelectedFamily(family);
    setIsFamilyDetailsOpen(true);
    fetchFamilyMembers(family.id);
  };

  // Copy UUID to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUUID(text);
      toast.success('UUID copied to clipboard');
      setTimeout(() => setCopiedUUID(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy UUID');
    }
  };

  // Filter families based on search term
  const filteredFamilies = families.filter(
    (family) =>
      family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOrganizationName(family.organization_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Create */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search families..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Family
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Family</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <Label htmlFor="name">Family Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
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
                  <SelectTrigger>
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
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Family</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Families Table */}
      <Card>
        <CardHeader>
          <CardTitle>Families ({filteredFamilies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm
                      ? 'No families found matching your search.'
                      : 'No families found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFamilies.map((family) => (
                  <TableRow
                    key={family.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleFamilyRowClick(family)}
                  >
                    <TableCell className="font-medium">{family.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getOrganizationName(family.organization_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          family.member_count && family.member_count > 0
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {family.member_count || 0} member
                        {(family.member_count || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(family.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(family);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !!(family.member_count && family.member_count > 0)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFamily(
                              family.id,
                              family.name,
                              family.member_count || 0
                            );
                          }}
                          title={
                            family.member_count && family.member_count > 0
                              ? 'Cannot delete family with active members'
                              : 'Delete family'
                          }
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Family</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFamily} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Family Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-organization">Organization</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, organization_id: value })
                }
              >
                <SelectTrigger>
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Family</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Family Details Modal */}
      <Dialog open={isFamilyDetailsOpen} onOpenChange={setIsFamilyDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Family Details</span>
            </DialogTitle>
          </DialogHeader>

          {selectedFamily && (
            <div className="space-y-6">
              {/* Family UUID Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Family UUID</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={selectedFamily.id}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedFamily.id)}
                  >
                    {copiedUUID === selectedFamily.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Family Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Family Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedFamily.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">
                    {getOrganizationName(selectedFamily.organization_id)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFamily.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFamily.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Family Members Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Family Members</Label>
                  <Badge variant="secondary">
                    {familyMembers.length} member
                    {familyMembers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : familyMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No family members found</p>
                    <p className="text-sm">
                      Members will appear here once they are added to this
                      family
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Joined{' '}
                            {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
