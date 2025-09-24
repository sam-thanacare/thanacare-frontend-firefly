'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';

interface MemberProgress {
  memberId: string;
  memberName: string;
  familyName: string;
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  overallProgress: number;
  lastActivity?: string;
}

interface Assignment {
  id: string;
  memberName: string;
  familyName: string;
  status: string;
  progress: number;
  assignedAt: string;
  dueDate?: string;
  notes?: string;
}

export default function TrainerDashboard() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberDisplay, setSelectedMemberDisplay] =
    useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !token) return;

      try {
        setIsLoading(true);

        // Get trainer ID from auth context
        // const trainerId = user.id;

        const backendUrl =
          process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

        // Load progress summary
        const progressResponse = await fetch(
          `${backendUrl}/api/dementia-tool/my-progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const progressList = progressData.data || progressData;

          // Ensure progressList is an array before calling map
          if (!Array.isArray(progressList)) {
            console.warn('Progress data is not an array:', progressList);
            setMemberProgress([]);
            return;
          }

          const transformedProgress: MemberProgress[] = progressList.map(
            (p: {
              member_id: string;
              member_name: string;
              family_name: string;
              total_assignments: number;
              completed_assignments: number;
              in_progress_assignments: number;
              overall_progress: number;
              last_activity?: string;
            }) => ({
              memberId: p.member_id,
              memberName: p.member_name,
              familyName: p.family_name,
              totalAssignments: p.total_assignments,
              completedAssignments: p.completed_assignments,
              inProgressAssignments: p.in_progress_assignments,
              overallProgress: Math.round(p.overall_progress),
              lastActivity: p.last_activity,
            })
          );

          setMemberProgress(transformedProgress);
        }

        // Load assignments
        const assignmentsResponse = await fetch(
          `${backendUrl}/api/dementia-tool/my-assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          const assignmentsList = assignmentsData.data || assignmentsData;

          // Ensure assignmentsList is an array before calling map
          if (!Array.isArray(assignmentsList)) {
            console.warn('Assignments data is not an array:', assignmentsList);
            setAssignments([]);
            return;
          }

          const transformedAssignments: Assignment[] = assignmentsList.map(
            (assignment: {
              assignment: {
                id: string;
                status: string;
                assigned_at: string;
                due_date?: string;
                notes?: string;
              };
              member: {
                name: string;
              };
              family: {
                name: string;
              };
              response?: {
                progress: number;
              };
            }) => ({
              id: assignment.assignment.id,
              memberName: assignment.member.name,
              familyName: assignment.family.name,
              status: assignment.assignment.status,
              progress: assignment.response?.progress || 0,
              assignedAt: assignment.assignment.assigned_at,
              dueDate: assignment.assignment.due_date,
              notes: assignment.assignment.notes,
            })
          );

          setAssignments(transformedAssignments);
        }
      } catch (error) {
        console.error('Error loading trainer dashboard data:', error);
        // Set empty state on error
        setMemberProgress([]);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, token]);

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

  const handleMemberSelection = (memberId: string) => {
    setSelectedMember(memberId);
    const member = memberProgress.find((m) => m.memberId === memberId);
    if (member) {
      setSelectedMemberDisplay(`${member.memberName} - ${member.familyName}`);
    } else {
      setSelectedMemberDisplay('');
    }
  };

  const calculateOverallStats = () => {
    const totalMembers = memberProgress.length;
    const totalAssignments = memberProgress.reduce(
      (sum, member) => sum + member.totalAssignments,
      0
    );
    const completedAssignments = memberProgress.reduce(
      (sum, member) => sum + member.completedAssignments,
      0
    );
    const inProgressAssignments = memberProgress.reduce(
      (sum, member) => sum + member.inProgressAssignments,
      0
    );
    const averageProgress =
      memberProgress.reduce((sum, member) => sum + member.overallProgress, 0) /
      totalMembers;

    return {
      totalMembers,
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      averageProgress: Math.round(averageProgress),
    };
  };

  const stats = calculateOverallStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner variant="circle" className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">firefly Tool Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor member progress and manage assignments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Assign Document
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="assign">Assign Document</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assignments
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalAssignments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Documents assigned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completedAssignments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Progress
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageProgress}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Member Progress Table */}
          <Card>
            <CardHeader>
              <CardTitle>Member Progress</CardTitle>
              <CardDescription>
                Overview of all members and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberProgress.map((member) => (
                    <TableRow key={member.memberId}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {member.memberName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {member.memberName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{member.familyName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">
                              {member.completedAssignments} completed
                            </span>
                            <span className="text-blue-600">
                              {member.inProgressAssignments} in progress
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{member.overallProgress}%</span>
                          </div>
                          <Progress
                            value={member.overallProgress}
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.lastActivity
                          ? formatDate(member.lastActivity)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>
                Detailed view of all firefly tool assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {assignment.memberName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {assignment.memberName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.familyName}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{assignment.progress}%</span>
                          </div>
                          <Progress
                            value={assignment.progress}
                            className={`w-20 ${getProgressColor(assignment.progress)}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(assignment.assignedAt)}</TableCell>
                      <TableCell>
                        {assignment.dueDate
                          ? formatDate(assignment.dueDate)
                          : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Assign firefly Tool Document</CardTitle>
              <CardDescription>
                Assign the firefly Values & Priorities Tool to family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-select">Select Family Member</Label>
                    <Select
                      value={selectedMember}
                      onValueChange={handleMemberSelection}
                    >
                      <SelectTrigger>
                        <span className="block truncate">
                          {selectedMemberDisplay || 'Select a member...'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {memberProgress.map((member) => (
                          <SelectItem
                            key={member.memberId}
                            value={member.memberId}
                          >
                            {member.memberName} - {member.familyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date (Optional)</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any notes or instructions for the member..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Assign Document</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
