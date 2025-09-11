'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Loader2,
  Search,
  Users,
  Calendar,
  Mail,
  Shield,
  Clock,
  Building2,
  Users2,
} from 'lucide-react';
import { CreateAdminUserForm } from './CreateAdminUserForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

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
  member_count?: number; // Number of members in this family
  status?: string; // Family status (active, inactive, etc.)
  last_activity?: string; // Last activity timestamp
}

interface UserWithProfile {
  user: User;
  organization?: Organization;
  family?: Family;
  families?: Family[]; // For trainers - families they manage
  members?: User[]; // For families - members in the family
  trainer?: User; // For members - the trainer associated with their family
}

export function UsersTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUserDetails = useCallback(
    async (user: User): Promise<UserWithProfile> => {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const userWithProfile: UserWithProfile = { user };

      try {
        // For trainers, fetch organization and families they manage
        if (user.role === 'trainer') {
          try {
            // Fetch families directly assigned to this trainer
            const familiesResponse = await fetch(
              `${backendUrl}/api/trainers/${user.id}/families`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (familiesResponse.ok) {
              const familiesData = await familiesResponse.json();
              const families = familiesData.data?.families || [];

              if (families.length > 0) {
                // Get organization info from the first family
                const firstFamily = families[0];

                // Fetch organization details
                try {
                  const orgResponse = await fetch(
                    `${backendUrl}/api/organizations/${firstFamily.organization_id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );

                  if (orgResponse.ok) {
                    const orgData = await orgResponse.json();
                    userWithProfile.organization = orgData.data;
                  } else {
                    // Fallback if organization fetch fails
                    userWithProfile.organization = {
                      id: firstFamily.organization_id,
                      name: 'Organization',
                      created_at: new Date().toISOString(),
                    };
                  }
                } catch (error) {
                  console.error('Error fetching organization:', error);
                  userWithProfile.organization = {
                    id: firstFamily.organization_id,
                    name: 'Organization',
                    created_at: new Date().toISOString(),
                  };
                }

                // Enhance family data with member counts and additional details
                const enhancedFamilies = await Promise.all(
                  families.map(async (family: Family) => {
                    try {
                      // Get family members to count them
                      const membersResponse = await fetch(
                        `${backendUrl}/api/families/${family.id}/members`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        }
                      );

                      let memberCount = 0;
                      if (membersResponse.ok) {
                        const membersData = await membersResponse.json();
                        const members = membersData.data || [];
                        memberCount = members.length;
                      }

                      return {
                        ...family,
                        member_count: memberCount,
                        status: 'active',
                        last_activity: new Date().toISOString(),
                      };
                    } catch (error) {
                      console.error('Error enhancing family data:', error);
                      return {
                        ...family,
                        member_count: 0,
                        status: 'unknown',
                      };
                    }
                  })
                );

                userWithProfile.families = enhancedFamilies;
              } else {
                // No families found for this trainer
                userWithProfile.families = [];
                userWithProfile.organization = undefined;
              }
            } else {
              console.warn('Failed to fetch families for trainer:', user.id);
              userWithProfile.families = [];
              userWithProfile.organization = undefined;
            }
          } catch (error) {
            console.error('Error fetching trainer data:', error);
            userWithProfile.organization = undefined;
            userWithProfile.families = [];
          }
        }

        // For members, fetch family details and trainer information
        if (user.role === 'member') {
          // Get all families to find which one this member belongs to
          const familiesResponse = await fetch(`${backendUrl}/api/families`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (familiesResponse.ok) {
            const familiesData = await familiesResponse.json();
            const families = familiesData.data || [];

            // Find the family this member belongs to
            // Note: In a real implementation, you'd have a direct endpoint for this
            // For now, we'll show the first family (simplified)
            userWithProfile.family = families[0]; // Simplified for demo

            // Fetch members for this family (simplified)
            if (families.length > 0) {
              // Get all users to find members in this family
              const usersResponse = await fetch(
                `${backendUrl}/api/admin/users`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                const allUsers = usersData.data || [];
                // Filter users who are members (simplified logic)
                userWithProfile.members = allUsers
                  .filter((u: User) => u.role === 'member')
                  .slice(0, 5);
              }

              // Fetch trainer information for this family
              // Get all users to find the trainer associated with this family's organization
              const usersForTrainerResponse = await fetch(
                `${backendUrl}/api/admin/users`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (usersForTrainerResponse.ok) {
                const usersForTrainerData =
                  await usersForTrainerResponse.json();
                const allUsersForTrainer = usersForTrainerData.data || [];

                // Find trainers (simplified logic - in real implementation you'd query by organization)
                const trainers = allUsersForTrainer.filter(
                  (u: User) => u.role === 'trainer'
                );
                if (trainers.length > 0) {
                  // For demo purposes, show the first trainer
                  // In real implementation, you'd find the trainer associated with the family's organization
                  userWithProfile.trainer = trainers[0];
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      return userWithProfile;
    },
    [token]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'trainer':
        return 'default';
      case 'member':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleRowClick = async (user: User) => {
    setModalLoading(true);
    setIsModalOpen(true);

    try {
      const userDetails = await fetchUserDetails(user);
      setSelectedUser(userDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUser({ user }); // Fallback to basic user info
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Loading users...</p>
          <p className="text-xs text-muted-foreground">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <Users className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium text-destructive">Failed to load users</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <Loader2 className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{filteredUsers.length}</span>
            <span className="text-muted-foreground">
              {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>
          <CreateAdminUserForm onUserCreated={fetchUsers} />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-full bg-muted p-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-medium text-muted-foreground">
                        {searchTerm ? 'No users found' : 'No users available'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm
                          ? 'Try adjusting your search criteria'
                          : 'Users will appear here once they are added to the system'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Details</span>
            </DialogTitle>
          </DialogHeader>

          {modalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading user details...
              </span>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Basic User Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {selectedUser.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedUser.user.name}
                    </h3>
                    <Badge
                      variant={getRoleBadgeVariant(selectedUser.user.role)}
                      className="capitalize"
                    >
                      {selectedUser.user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {selectedUser.user.email}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">
                      {selectedUser.user.role}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(
                        selectedUser.user.created_at
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(
                        selectedUser.user.updated_at
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-Specific Information */}
              {selectedUser.user.role === 'trainer' &&
                selectedUser.organization && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Organization Details</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">
                          Organization:
                        </span>
                        <span className="font-medium">
                          {selectedUser.organization.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedUser.organization.created_at
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {selectedUser.families ? (
                      selectedUser.families.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          <h5 className="font-medium text-sm flex items-center space-x-2">
                            <Users2 className="h-4 w-4" />
                            <span>
                              Families Managed ({selectedUser.families.length})
                            </span>
                          </h5>

                          {/* Family Statistics */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-background p-3 rounded border text-center">
                              <div className="text-lg font-semibold text-primary">
                                {selectedUser.families.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total Families
                              </div>
                            </div>
                            <div className="bg-background p-3 rounded border text-center">
                              <div className="text-lg font-semibold text-primary">
                                {selectedUser.families.reduce(
                                  (total, family) =>
                                    total + (family.member_count || 0),
                                  0
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total Members
                              </div>
                            </div>
                          </div>

                          {/* Family Details */}
                          <div className="space-y-2">
                            {selectedUser.families.map((family) => (
                              <div
                                key={family.id}
                                className="bg-background p-3 rounded border"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-semibold text-primary">
                                        {family.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm">
                                        {family.name}
                                      </span>
                                      {family.status && (
                                        <Badge
                                          variant={
                                            family.status === 'active'
                                              ? 'default'
                                              : 'secondary'
                                          }
                                          className="text-xs w-fit mt-1"
                                        >
                                          {family.status}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {family.member_count || 0} members
                                    </Badge>
                                    {family.last_activity && (
                                      <span className="text-xs text-muted-foreground">
                                        Active{' '}
                                        {new Date(
                                          family.last_activity
                                        ).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                  <span>
                                    Created{' '}
                                    {new Date(
                                      family.created_at
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                  <span>ID: {family.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-muted/20 rounded-lg border-dashed border-2 border-muted-foreground/20">
                          <div className="text-center space-y-2">
                            <Users2 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                              No Families Assigned
                            </p>
                            <p className="text-xs text-muted-foreground">
                              This trainer doesn&apos;t have any families
                              assigned yet.
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="mt-4 p-4 bg-muted/20 rounded-lg border-dashed border-2 border-muted-foreground/20">
                        <div className="text-center space-y-2">
                          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">
                            Loading Family Data...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fetching family information for this trainer.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {selectedUser.user.role === 'member' && selectedUser.family && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Users2 className="h-4 w-4" />
                    <span>Family Details</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Family:</span>
                      <span className="font-medium">
                        {selectedUser.family.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedUser.family.created_at
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Trainer Information */}
                  {selectedUser.trainer && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-sm flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Assigned Trainer</span>
                      </h5>
                      <div className="bg-background p-3 rounded border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {selectedUser.trainer.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {selectedUser.trainer.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedUser.trainer.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.members && selectedUser.members.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-sm flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>
                          Other Family Members ({selectedUser.members.length})
                        </span>
                      </h5>
                      <div className="space-y-1">
                        {selectedUser.members.map((member) => (
                          <div
                            key={member.id}
                            className="text-sm bg-background p-2 rounded border"
                          >
                            <span className="font-medium">{member.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {member.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Click outside or press ESC to close
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
