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
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

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
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Fetch users for selection
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      const backendUrl =
        process.env.THANACARE_BACKEND || 'http://localhost:8080';
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
      console.error('Error fetching users:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update selected user when prop changes
  useEffect(() => {
    if (propSelectedUser !== undefined) {
      setSelectedUser(propSelectedUser);
    }
  }, [propSelectedUser]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserSelector(false);
    onUserSelectionChange?.(user);
  };

  const generateSecurePassword = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const backendUrl =
        process.env.THANACARE_BACKEND || 'http://localhost:8080';
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
        throw new Error('Failed to generate password');
      }

      const data = await response.json();
      setGeneratedPassword(data.data.password);
      setNewPassword(data.data.password);
    } catch (err) {
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

    if (!token) return;

    try {
      setLoading(true);
      const backendUrl =
        process.env.THANACARE_BACKEND || 'http://localhost:8080';
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setMessage({
        type: 'success',
        text: `Password successfully reset for ${selectedUser.name}`,
      });

      // Clear form
      setSelectedUser(null);
      setNewPassword('');
      setGeneratedPassword('');
    } catch (err) {
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
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  return (
    <div className="space-y-6">
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
              disabled={loading}
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
              <AlertDescription>
                This 12-character password includes uppercase, lowercase,
                numbers, and special characters for maximum security.
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
                >
                  {selectedUser ? (
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
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.name} ${user.email}`}
                          onSelect={() => handleUserSelect(user)}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <Users className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                          <Check
                            className={`ml-auto h-4 w-4 ${
                              selectedUser?.id === user.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                          />
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Reset Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={resetPassword}
              disabled={
                loading ||
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
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Please select a user first</span>
              </div>
            )}
          </div>

          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
            >
              <AlertDescription className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{message.text}</span>
              </AlertDescription>
            </Alert>
          )}
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
