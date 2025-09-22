'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, X, Save, Heart } from 'lucide-react';
import { debugLogger } from '@/lib/utils/debugLogger';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function MemberFamilyTab() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
  });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Load family members from API
  useEffect(() => {
    const loadFamilyMembers = async () => {
      debugLogger.info('MemberFamilyTab', 'Starting to load family members');
      debugLogger.info('MemberFamilyTab', 'User ID', { userId: user?.id });
      debugLogger.info('MemberFamilyTab', 'Token exists', {
        hasToken: !!token,
      });

      if (!user?.id) {
        debugLogger.warn(
          'MemberFamilyTab',
          'No user ID, skipping family members load'
        );
        return;
      }

      try {
        setIsLoadingFamily(true);
        setFamilyError(null);
        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        console.log('🌐 MemberFamilyTab: Backend URL:', backendUrl);

        if (!token) {
          console.error('❌ MemberFamilyTab: No authentication token found');
          throw new Error('Authentication required');
        }

        console.log(
          '📡 MemberFamilyTab: Making API call to:',
          `${backendUrl}/api/member/my-family-members`
        );
        console.log(
          '🔐 MemberFamilyTab: Using token (first 20 chars):',
          token.substring(0, 20) + '...'
        );

        const response = await fetch(
          `${backendUrl}/api/member/my-family-members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(
          '📊 MemberFamilyTab: Family API Response status:',
          response.status
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            '❌ MemberFamilyTab: Family API Error:',
            response.status,
            errorText
          );
          throw new Error(
            `Failed to load family members: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('📦 MemberFamilyTab: Raw family API response:', data);

        const familyMembersData = data.data || data;
        console.log(
          '👥 MemberFamilyTab: Family members data:',
          familyMembersData
        );

        // Ensure familyMembersData is an array before calling map
        if (!Array.isArray(familyMembersData)) {
          console.warn(
            '⚠️ MemberFamilyTab: Family members data is not an array:',
            familyMembersData
          );
          setFamilyMembers([]);
          return;
        }

        // Transform API data to component format
        console.log('🔄 MemberFamilyTab: Transforming family members data...');
        const transformedFamilyMembers: FamilyMember[] = familyMembersData.map(
          (member: {
            id: string;
            name: string;
            email: string;
            role: string;
            created_at: string;
            updated_at: string;
          }) => {
            console.log(
              '👤 MemberFamilyTab: Processing family member:',
              member
            );
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role,
              created_at: member.created_at,
              updated_at: member.updated_at,
            };
          }
        );

        console.log(
          '✅ MemberFamilyTab: Transformed family members:',
          transformedFamilyMembers
        );
        setFamilyMembers(transformedFamilyMembers);
        console.log('✅ MemberFamilyTab: Successfully loaded family members');
      } catch (error) {
        console.error(
          '❌ MemberFamilyTab: Error loading family members:',
          error
        );
        console.error('❌ MemberFamilyTab: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });
        setFamilyError(
          error instanceof Error
            ? error.message
            : 'Failed to load family members'
        );
        // Set empty state on error
        setFamilyMembers([]);
      } finally {
        console.log('🏁 MemberFamilyTab: Family members loading completed');
        setIsLoadingFamily(false);
      }
    };

    loadFamilyMembers();
  }, [user?.id, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      setMemberError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmittingMember(true);
      setMemberError(null);

      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      const response = await fetch(
        `${backendUrl}/api/member/add-family-member`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: memberForm.name.trim(),
            email: memberForm.email.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add family member');
      }

      // Reset form and close
      setMemberForm({ name: '', email: '' });
      setShowAddMemberForm(false);

      // Reload family members
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error adding family member:', error);
      setMemberError(
        error instanceof Error ? error.message : 'Failed to add family member'
      );
    } finally {
      setIsSubmittingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parent/Guardian Section */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1 rounded bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                Parent/Guardian
              </CardTitle>
              <CardDescription>
                Your family members and caregivers involved in your dementia
                care planning
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddMemberForm(true)}
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Parent/Guardian
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Member Form */}
          {showAddMemberForm && (
            <div className="mb-6 p-4 border border-accent/20 rounded-lg bg-accent/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-accent">
                  Add Parent/Guardian
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddMemberForm(false);
                    setMemberForm({ name: '', email: '' });
                    setMemberError(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="member-name"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="member-name"
                      type="text"
                      value={memberForm.name}
                      onChange={(e) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="member-email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="member-email"
                      type="email"
                      value={memberForm.email}
                      onChange={(e) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {memberError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {memberError}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingMember}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isSubmittingMember ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Member
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMemberForm(false);
                      setMemberForm({ name: '', email: '' });
                      setMemberError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isLoadingFamily ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading family members...
              </span>
            </div>
          ) : familyError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-destructive"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Error Loading Family Members
                  </h3>
                  <p className="text-sm text-destructive/80 mt-1">
                    {familyError}
                  </p>
                </div>
              </div>
            </div>
          ) : familyMembers.length > 0 ? (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-all bg-gradient-to-r from-background to-muted/20"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 ring-2 ring-accent/20">
                      <AvatarFallback className="text-sm bg-accent/10 text-accent">
                        {member.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-accent/10 text-accent"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Family Member
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined {formatDate(member.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Family Members Found
              </h3>
              <p className="text-gray-500 mb-4">
                You don&apos;t have any family members associated with your
                account yet. Contact your trainer or administrator to add family
                members to your profile.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
