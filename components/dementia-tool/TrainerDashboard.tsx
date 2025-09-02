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
  SelectValue,
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
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Mock data for demonstration
  useEffect(() => {
    const mockMemberProgress: MemberProgress[] = [
      {
        memberId: '1',
        memberName: 'John Smith',
        familyName: 'Smith Family',
        totalAssignments: 3,
        completedAssignments: 2,
        inProgressAssignments: 1,
        overallProgress: 75,
        lastActivity: '2024-01-15T10:30:00Z',
      },
      {
        memberId: '2',
        memberName: 'Mary Johnson',
        familyName: 'Johnson Family',
        totalAssignments: 2,
        completedAssignments: 1,
        inProgressAssignments: 1,
        overallProgress: 50,
        lastActivity: '2024-01-14T14:20:00Z',
      },
      {
        memberId: '3',
        memberName: 'Robert Davis',
        familyName: 'Davis Family',
        totalAssignments: 1,
        completedAssignments: 0,
        inProgressAssignments: 1,
        overallProgress: 25,
        lastActivity: '2024-01-13T09:15:00Z',
      },
    ];

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        memberName: 'John Smith',
        familyName: 'Smith Family',
        status: 'completed',
        progress: 100,
        assignedAt: '2024-01-10T10:00:00Z',
        dueDate: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        memberName: 'John Smith',
        familyName: 'Smith Family',
        status: 'completed',
        progress: 100,
        assignedAt: '2024-01-05T10:00:00Z',
        dueDate: '2024-01-12T10:00:00Z',
      },
      {
        id: '3',
        memberName: 'John Smith',
        familyName: 'Smith Family',
        status: 'in_progress',
        progress: 60,
        assignedAt: '2024-01-12T10:00:00Z',
        dueDate: '2024-01-20T10:00:00Z',
      },
      {
        id: '4',
        memberName: 'Mary Johnson',
        familyName: 'Johnson Family',
        status: 'completed',
        progress: 100,
        assignedAt: '2024-01-08T10:00:00Z',
        dueDate: '2024-01-15T10:00:00Z',
      },
      {
        id: '5',
        memberName: 'Mary Johnson',
        familyName: 'Johnson Family',
        status: 'in_progress',
        progress: 40,
        assignedAt: '2024-01-13T10:00:00Z',
        dueDate: '2024-01-22T10:00:00Z',
      },
      {
        id: '6',
        memberName: 'Robert Davis',
        familyName: 'Davis Family',
        status: 'in_progress',
        progress: 25,
        assignedAt: '2024-01-14T10:00:00Z',
        dueDate: '2024-01-25T10:00:00Z',
      },
    ];

    setMemberProgress(mockMemberProgress);
    setAssignments(mockAssignments);
    setIsLoading(false);
  }, []);

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
          <h1 className="text-3xl font-bold">Dementia Tool Dashboard</h1>
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
                Detailed view of all dementia tool assignments
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
              <CardTitle>Assign Dementia Tool Document</CardTitle>
              <CardDescription>
                Assign the Dementia Values & Priorities Tool to family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-select">Select Family Member</Label>
                    <Select
                      value={selectedMember}
                      onValueChange={setSelectedMember}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member..." />
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
