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

import { Loader2, Search, Activity, CheckCircle, XCircle } from 'lucide-react';

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

export function LoginRecordsTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 50;

  const fetchLoginRecords = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const backendUrl =
        process.env.THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(
        `${backendUrl}/api/admin/login-records?limit=${pageSize}&offset=${currentPage * pageSize}`,
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
      setRecords(data.data.records || []);
      setTotalCount(data.data.total_count || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch login records'
      );
      console.error('Error fetching login records:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    fetchLoginRecords();
  }, [fetchLoginRecords]);

  const filteredRecords = records.filter(
    (record) =>
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.user_agent &&
        record.user_agent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.ip_address && record.ip_address.includes(searchTerm))
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
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

  if (error) {
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
      {/* Search and Stats */}
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
          <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{totalCount}</span>
            <span className="text-muted-foreground">records</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {filteredRecords.filter((r) => r.success).length} successful
            </span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-red-50 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              {filteredRecords.filter((r) => !r.success).length} failed
            </span>
          </div>
        </div>
      </div>

      {/* Login Records Table */}
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
                        {searchTerm
                          ? 'No records found'
                          : 'No activity records'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm
                          ? 'Try adjusting your search criteria'
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
                      <div className="text-xs text-muted-foreground mt-1">
                        {record.failure_reason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{record.email}</TableCell>
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
                    {new Date(record.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to{' '}
            {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount}{' '}
            records
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
                  Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                if (pageNumber >= totalPages) return null;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
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
      )}
    </div>
  );
}
