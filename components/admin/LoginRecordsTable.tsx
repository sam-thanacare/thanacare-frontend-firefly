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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import {
  Loader2,
  Search,
  Activity,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

interface LoginRecord {
  id: string;
  user_id: string | null;
  email: string;
  user_agent: string | null;
  ip_address: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

interface ActivityStats {
  totalRecords: number;
  successfulLogins: number;
  failedLogins: number;
}

export function LoginRecordsTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filterSuccess, setFilterSuccess] = useState<
    'all' | 'success' | 'failed'
  >('all');
  const [filterTimeRange, setFilterTimeRange] = useState<
    'all' | '24h' | '7d' | '30d'
  >('all');
  const [stats, setStats] = useState<ActivityStats>({
    totalRecords: 0,
    successfulLogins: 0,
    failedLogins: 0,
  });
  const pageSize = 50;

  const fetchLoginRecords = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Build query parameters
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
      });

      if (filterSuccess !== 'all') {
        params.append(
          'success',
          filterSuccess === 'success' ? 'true' : 'false'
        );
      }

      const response = await fetch(
        `${backendUrl}/api/admin/login-records?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch login records');
      }

      const data = await response.json();
      const fetchedRecords = data.data.records || [];
      setRecords(fetchedRecords);
      setTotalCount(data.data.total_count || 0);

      // Calculate stats
      setStats({
        totalRecords: data.data.total_count || 0,
        successfulLogins: fetchedRecords.filter((r: LoginRecord) => r.success)
          .length,
        failedLogins: fetchedRecords.filter((r: LoginRecord) => !r.success)
          .length,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch login records'
      );
      console.error('Error fetching login records:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize, filterSuccess]);

  useEffect(() => {
    fetchLoginRecords();
  }, [fetchLoginRecords]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.user_agent &&
        record.user_agent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.ip_address && record.ip_address.includes(searchTerm));

    const matchesTimeFilter =
      filterTimeRange === 'all' ||
      (() => {
        const recordDate = new Date(record.created_at);
        const now = new Date();
        switch (filterTimeRange) {
          case '24h':
            return now.getTime() - recordDate.getTime() <= 24 * 60 * 60 * 1000;
          case '7d':
            return (
              now.getTime() - recordDate.getTime() <= 7 * 24 * 60 * 60 * 1000
            );
          case '30d':
            return (
              now.getTime() - recordDate.getTime() <= 30 * 24 * 60 * 60 * 1000
            );
          default:
            return true;
        }
      })();

    return matchesSearch && matchesTimeFilter;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Loading activity records...</p>
          <p className="text-xs text-muted-foreground">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <Activity className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium text-destructive">Failed to load records</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchLoginRecords} variant="outline" size="sm">
          <Loader2 className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulLogins}
            </div>
            <p className="text-xs text-muted-foreground">Login attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failedLogins}
            </div>
            <p className="text-xs text-muted-foreground">Login attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Controls & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, IP, or user agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter" className="text-sm">
                  Status:
                </Label>
                <Select
                  value={filterSuccess}
                  onValueChange={(value: 'all' | 'success' | 'failed') =>
                    setFilterSuccess(value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="time-filter" className="text-sm">
                  Time Range:
                </Label>
                <Select
                  value={filterTimeRange}
                  onValueChange={(value: 'all' | '24h' | '7d' | '30d') =>
                    setFilterTimeRange(value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Login Activity Records</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {totalCount} records
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">IP Address</TableHead>
                  <TableHead className="font-semibold">User Agent</TableHead>
                  <TableHead className="font-semibold">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="rounded-full bg-muted p-3">
                          <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium text-muted-foreground">
                            {searchTerm ||
                            filterSuccess !== 'all' ||
                            filterTimeRange !== 'all'
                              ? 'No records found'
                              : 'No activity records'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ||
                            filterSuccess !== 'all' ||
                            filterTimeRange !== 'all'
                              ? 'Try adjusting your search criteria or filters'
                              : 'Login attempts will appear here'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {record.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            variant={record.success ? 'default' : 'destructive'}
                          >
                            {record.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        {!record.success && record.failure_reason && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs">
                            {record.failure_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.email}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {record.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div
                          className="truncate"
                          title={record.user_agent || undefined}
                        >
                          {record.user_agent || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(record.created_at).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                          <span className="text-xs">
                            {new Date(record.created_at).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to{' '}
                {Math.min((currentPage + 1) * pageSize, totalCount)} of{' '}
                {totalCount} records
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber =
                      Math.max(0, Math.min(totalPages - 5, currentPage - 2)) +
                      i;
                    if (pageNumber >= totalPages) return null;
                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === currentPage ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
