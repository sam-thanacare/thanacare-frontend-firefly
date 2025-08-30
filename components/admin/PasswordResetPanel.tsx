'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Key,
  RefreshCw,
  Copy,
  Check,
  XCircle,
  Users,
  ChevronDown,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface PasswordResetPanelProps {
  selectedUser?: User | null;
  onUserSelectionChange?: (user: User | null) => void;
}

export function PasswordResetPanel({
  selectedUser: propSelectedUser,
  onUserSelectionChange,
}: PasswordResetPanelProps) {
  const { token } = useAppSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    propSelectedUser || null
  );
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [lastResetUser, setLastResetUser] = useState<User | null>(null);

  // Fetch users for selection
  const fetchUsers = useCallback(async () => {
    console.log(
      'PasswordResetPanel: fetchUsers called, token:',
      token ? 'Present' : 'Missing'
    );

    if (!token) {
      setMessage({
        type: 'error',
        text: 'Authentication required. Please login first.',
      });
      return;
    }

    try {
      setUsersLoading(true);
      setMessage(null);

      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      console.log('PasswordResetPanel: Fetching from backend URL:', backendUrl);

      const response = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('PasswordResetPanel: Response status:', response.status);
      console.log(
        'PasswordResetPanel: Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
      }

      const data = await response.json();
      const usersList = data.data || [];
      console.log('PasswordResetPanel: Fetched users data:', {
        data,
        usersList,
      });
      setUsers(usersList);

      if (usersList.length === 0) {
        setMessage({
          type: 'info',
          text: 'No users found in the system.',
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch users',
      });
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    console.log(
      'PasswordResetPanel: Component mounted, token:',
      token ? 'Present' : 'Missing'
    );
    fetchUsers();
  }, [fetchUsers, token]);

  // Debug: Log when users state changes
  useEffect(() => {
    console.log('PasswordResetPanel: Users state changed:', users);
  }, [users]);

  // Initialize selected user when component mounts or prop changes
  useEffect(() => {
    console.log(
      'PasswordResetPanel: propSelectedUser changed:',
      propSelectedUser
    );
    if (propSelectedUser !== undefined) {
      setSelectedUser(propSelectedUser);
      // Clear any previous messages when user changes
      setMessage(null);
      // Clear any previous generated password when user changes
      setGeneratedPassword('');
      setNewPassword('');
    }
  }, [propSelectedUser]);

  const handleUserSelect = (user: User) => {
    console.log('PasswordResetPanel: User selected:', user);
    setShowUserSelector(false);
    onUserSelectionChange?.(user);
    setMessage(null); // Clear any previous messages
  };

  const generateSecurePassword = async () => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Authentication required. Please login first.',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(
        `${backendUrl}/api/admin/generate-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to generate password: ${response.status}`);
        }
      }

      const data = await response.json();
      const password = data.data.password;
      setGeneratedPassword(password);
      setNewPassword(password);

      setMessage({
        type: 'success',
        text: 'Secure password generated successfully!',
      });
    } catch (err) {
      console.error('Error generating password:', err);
      setMessage({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Failed to generate password',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      setMessage({
        type: 'error',
        text: 'Please select a user and enter a password',
      });
      return;
    }

    if (!token) {
      setMessage({
        type: 'error',
        text: 'Authentication required. Please login first.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/admin/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid request data');
        } else {
          throw new Error(`Failed to reset password: ${response.status}`);
        }
      }

      setMessage({
        type: 'success',
        text: `Password successfully reset for ${selectedUser.name}`,
      });

      // Store the last reset user for reference
      setLastResetUser(selectedUser);

      // Clear form and selection
      setSelectedUser(null);
      setNewPassword('');
      setGeneratedPassword('');

      // Notify parent component that user selection should be cleared
      onUserSelectionChange?.(null);

      // Refresh users list to ensure data is current
      fetchUsers();
    } catch (err) {
      console.error('Error resetting password:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset password',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedPassword) return;

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      setMessage({
        type: 'success',
        text: 'Password copied to clipboard!',
      });
    } catch (err) {
      console.error('Failed to copy password:', err);
      setMessage({
        type: 'error',
        text: 'Failed to copy password to clipboard',
      });
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className="animate-in slide-in-from-top-2"
        >
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Check className="h-4 w-4" />
              ) : message.type === 'error' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <span>{message.text}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessage}
              className="h-6 w-6 p-0"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Last Reset Success */}
      {lastResetUser && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Success!</strong> Password was reset for{' '}
            <strong>{lastResetUser.name}</strong> ({lastResetUser.email})
          </AlertDescription>
        </Alert>
      )}

      {/* Password Generation Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <span>Generate Secure Password</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a cryptographically secure password for user accounts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={generateSecurePassword}
              disabled={loading || usersLoading}
              className="flex items-center space-x-2 w-fit"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Generate Password</span>
            </Button>

            {generatedPassword && (
              <div className="flex items-center space-x-2 flex-1">
                <div className="relative flex-1">
                  <Input
                    value={generatedPassword}
                    readOnly
                    className="font-mono pr-12"
                    placeholder="Generated password will appear here"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewPassword(generatedPassword)}
                  className="whitespace-nowrap"
                >
                  Use This
                </Button>
              </div>
            )}
          </div>

          {generatedPassword && (
            <Alert>
              <AlertDescription className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>
                  This {generatedPassword.length}-character password includes
                  uppercase, lowercase, numbers, and special characters for
                  maximum security.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Password Reset Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Reset User Password</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a user and reset their password immediately
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select User</Label>

            <Popover open={showUserSelector} onOpenChange={setShowUserSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showUserSelector}
                  className="w-full justify-between"
                  disabled={usersLoading}
                >
                  {usersLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  ) : selectedUser ? (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="truncate">
                        {selectedUser.name} ({selectedUser.email})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Select a user...
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="flex flex-col">
                  {/* Debug info */}
                  <div className="p-2 text-xs text-muted-foreground border-b">
                    Debug: users.length = {users.length}, usersLoading ={' '}
                    {usersLoading.toString()}
                  </div>
                  {users.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {usersLoading ? 'Loading users...' : 'No users found.'}
                    </div>
                  ) : (
                    users.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        role="option"
                        onClick={() => handleUserSelect(user)}
                        className="justify-start text-left"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.email} • {user.role}
                          </span>
                        </div>
                        <Check
                          className={`ml-auto h-4 w-4 ${
                            selectedUser?.id === user.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                        />
                      </Button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Show selected user info */}
            {selectedUser && (
              <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Selected User</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.name} ({selectedUser.email}) •{' '}
                      {selectedUser.role}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(null);
                      onUserSelectionChange?.(null);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title="Clear selection"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {users.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Found {users.length} user{users.length !== 1 ? 's' : ''} in the
                system
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password or use generated one"
              className="font-mono"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
              {newPassword.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      newPassword.length >= 8 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {newPassword.length}/8 characters
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={resetPassword}
              disabled={
                loading ||
                usersLoading ||
                !selectedUser ||
                !newPassword.trim() ||
                newPassword.length < 8
              }
              className="flex items-center space-x-2 w-fit"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              <span>Reset Password</span>
            </Button>

            {!selectedUser && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Please select a user first</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How to Reset Passwords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              1
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Select a user</p>
              <p className="text-xs text-muted-foreground">
                Click the user selector dropdown and choose the user whose
                password you want to reset
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              2
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Generate or enter a password
              </p>
              <p className="text-xs text-muted-foreground">
                Use the secure password generator above or enter a custom
                password manually
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              3
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Reset the password</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Reset Password&quot; to apply the new password
                immediately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
