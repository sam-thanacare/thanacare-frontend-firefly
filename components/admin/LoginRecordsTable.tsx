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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

// Custom hook to calculate optimal page size based on device height
function useOptimalPageSize() {
  const [pageSize, setPageSize] = useState(50);
  const [availablePageSizes] = useState([15, 25, 50, 75, 100]);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    const calculateOptimalPageSize = () => {
      // Check if window is available (SSR safety)
      if (typeof window === 'undefined') return;

      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Detect device type for better estimation
      const isMobile = viewportWidth < 768;
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

      // Adjust row height based on device type
      let estimatedRowHeight = 80; // default desktop
      if (isMobile) {
        estimatedRowHeight = 100; // mobile rows are taller due to touch targets
      } else if (isTablet) {
        estimatedRowHeight = 90; // tablet is in between
      }

      // Adjust header heights based on device type
      let headerHeight = 200; // desktop
      let navigationHeight = 100;
      const tableHeaderHeight = 60;
      let margins = 100;

      if (isMobile) {
        headerHeight = 300; // mobile has stacked layout
        navigationHeight = 150; // pagination takes more space on mobile
        margins = 80;
      } else if (isTablet) {
        headerHeight = 250;
        navigationHeight = 120;
        margins = 90;
      }

      // Calculate available height for table rows
      const availableHeight =
        viewportHeight -
        headerHeight -
        navigationHeight -
        tableHeaderHeight -
        margins;

      // Calculate how many rows can fit comfortably (with some buffer)
      const optimalRows = Math.floor(availableHeight / estimatedRowHeight) - 1;

      // Find the closest available page size
      let optimalPageSize = 50; // default fallback
      let minDifference = Math.abs(optimalRows - 50);

      for (const size of availablePageSizes) {
        const difference = Math.abs(optimalRows - size);
        if (difference < minDifference) {
          minDifference = difference;
          optimalPageSize = size;
        }
      }

      // Ensure minimum and maximum bounds
      optimalPageSize = Math.max(15, Math.min(100, optimalPageSize));

      // Mark as optimized if we're not using the default
      setIsOptimized(optimalPageSize !== 50);

      setPageSize(optimalPageSize);
    };

    // Calculate on mount and window resize
    calculateOptimalPageSize();

    const handleResize = () => {
      calculateOptimalPageSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [availablePageSizes]);

  return { pageSize, setPageSize, availablePageSizes, isOptimized };
}

export function LoginRecordsTable() {
  const { token } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
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
  const { pageSize, setPageSize, availablePageSizes, isOptimized } =
    useOptimalPageSize();
  const [jumpToPage, setJumpToPage] = useState('');

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filterSuccess, filterTimeRange, pageSize]);

  const fetchLoginRecords = useCallback(
    async (isPageChange = false) => {
      if (!token) return;

      try {
        if (isPageChange) {
          setPageLoading(true);
        } else {
          setLoading(true);
        }

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
        if (isPageChange) {
          setPageLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [token, currentPage, pageSize, filterSuccess]
  );

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

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage) - 1;
    if (pageNum >= 0 && pageNum < totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPage(i)}
            className="w-9 h-9 p-0 text-sm font-medium"
          >
            {i + 1}
          </Button>
        );
      }
    } else {
      // Show pages with ellipsis for large ranges
      const startPage = Math.max(0, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      // Always show first page
      pages.push(
        <Button
          key={0}
          variant={0 === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentPage(0)}
          className="w-9 h-9 p-0 text-sm font-medium"
        >
          1
        </Button>
      );

      // Add ellipsis if needed
      if (startPage > 1) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }

      // Show middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i > 0 && i < totalPages - 1) {
          pages.push(
            <Button
              key={i}
              variant={i === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(i)}
              className="w-9 h-9 p-0 text-sm font-medium"
            >
              {i + 1}
            </Button>
          );
        }
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(
          <Button
            key={totalPages - 1}
            variant={totalPages - 1 === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPage(totalPages - 1)}
            className="w-9 h-9 p-0 text-sm font-medium"
          >
            {totalPages}
          </Button>
        );
      }
    }

    return pages;
  };

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
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Login Activity Records</CardTitle>
              {pageLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Showing {filteredRecords.length} of {totalCount} records
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                Page size: {pageSize} (Auto-optimized)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/30 border-b border-border/50">
                  <TableHead className="font-semibold text-foreground bg-muted/30 px-6 py-3">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground bg-muted/30 px-6 py-3">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-foreground bg-muted/30 px-6 py-3">
                    IP Address
                  </TableHead>
                  <TableHead className="font-semibold text-foreground bg-muted/30 px-6 py-3">
                    User Agent
                  </TableHead>
                  <TableHead className="font-semibold text-foreground bg-muted/30 px-6 py-3">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="text-center space-y-2">
                          <p className="font-medium text-foreground">
                            Loading page {currentPage + 1}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Please wait while we fetch the records
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-muted/50 p-4">
                          <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="font-medium text-foreground">
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
                    <TableRow
                      key={record.id}
                      className="hover:bg-muted/30 transition-colors border-b border-border/30"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {record.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            variant={record.success ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {record.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        {!record.success && record.failure_reason && (
                          <div className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                            {record.failure_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium">
                        {record.email}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        {record.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div
                          className="truncate text-sm"
                          title={record.user_agent || undefined}
                        >
                          {record.user_agent || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-foreground">
                            {new Date(record.created_at).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
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
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Section - Record Info & Page Size */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-sm text-muted-foreground font-medium">
                  Showing {currentPage * pageSize + 1} to{' '}
                  {Math.min((currentPage + 1) * pageSize, totalCount)} of{' '}
                  {totalCount} records
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center space-x-3">
                  <Label
                    htmlFor="page-size"
                    className="text-sm font-medium text-foreground"
                  >
                    Page size:
                  </Label>
                  <div className="relative">
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(parseInt(value))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePageSizes.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOptimized && (
                      <div className="absolute -top-8 left-0 bg-green-100 text-green-700 text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-sm">
                        Optimized for your screen
                      </div>
                    )}
                  </div>
                  {isOptimized ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center space-x-1 font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Auto-optimized
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      (Default size)
                    </span>
                  )}
                </div>
              </div>

              {/* Right Section - Navigation Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Jump to Page */}
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="jump-to-page"
                    className="text-sm font-medium text-foreground"
                  >
                    Go to:
                  </Label>
                  <Input
                    id="jump-to-page"
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-16 h-9 text-center text-sm"
                    placeholder="Page"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleJumpToPage}
                    disabled={
                      !jumpToPage ||
                      parseInt(jumpToPage) < 1 ||
                      parseInt(jumpToPage) > totalPages
                    }
                    className="h-9 px-3"
                  >
                    Go
                  </Button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    title="First page"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    title="Previous page"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {renderPageNumbers()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                    title="Next page"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    title="Last page"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
