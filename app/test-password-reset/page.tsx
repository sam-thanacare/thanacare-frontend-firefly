'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, RefreshCw, Check, XCircle } from 'lucide-react';

export default function TestPasswordReset() {
  const [email, setEmail] = useState('admin@thanacare.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [resetTarget, setResetTarget] = useState(
    'c1906fb5-2c22-431d-aba0-1b5ae85cc9c3'
  );

  const backendUrl = process.env.THANACARE_BACKEND || 'http://localhost:8080';

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.data.token);
      setMessage({
        type: 'success',
        text: `Login successful! Welcome ${data.data.user.user.name}`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = async () => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Please login first',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
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
      setMessage({
        type: 'success',
        text: 'Password generated successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to generate password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Please login first',
      });
      return;
    }

    if (!generatedPassword) {
      setMessage({
        type: 'error',
        text: 'Please generate a password first',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/api/admin/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: resetTarget,
          new_password: generatedPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Password reset successful: ${data.data.message}`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to reset password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNewPassword = async () => {
    if (!generatedPassword) {
      setMessage({
        type: 'error',
        text: 'Please generate a password first',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Test login with the new password for the target user
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sarah.member@thanacare.com', // Using the test user email
          password: generatedPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Login with new password failed');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Login with new password successful! Welcome ${data.data.user.user.name}`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Login with new password failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Password Reset Integration Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the complete password reset functionality
          </p>
        </div>

        {/* Login Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Step 1: Admin Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@thanacare.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </div>
            </div>
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Login
            </Button>
            {token && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Token received: {token.substring(0, 20)}...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Password Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Step 2: Generate Secure Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGeneratePassword}
              disabled={loading || !token}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Generate Password
            </Button>
            {generatedPassword && (
              <div className="space-y-2">
                <Label>Generated Password</Label>
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Length: {generatedPassword.length} characters
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Step 3: Reset User Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resetTarget">Target User ID</Label>
              <Input
                id="resetTarget"
                value={resetTarget}
                onChange={(e) => setResetTarget(e.target.value)}
                placeholder="User ID to reset password for"
              />
            </div>
            <Button
              onClick={handleResetPassword}
              disabled={loading || !token || !generatedPassword}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reset Password
            </Button>
          </CardContent>
        </Card>

        {/* Test New Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>Step 4: Test New Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestNewPassword}
              disabled={loading || !generatedPassword}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Test Login with New Password
            </Button>
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Login as admin</p>
                <p className="text-xs text-muted-foreground">
                  Use the default admin credentials to authenticate
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </div>
              <div>
                <p className="text-sm font-medium">
                  Generate a secure password
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the admin endpoint to generate a cryptographically secure
                  password
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Reset user password</p>
                <p className="text-xs text-muted-foreground">
                  Use the admin endpoint to reset a user&apos;s password
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </div>
              <div>
                <p className="text-sm font-medium">Verify the reset</p>
                <p className="text-xs text-muted-foreground">
                  Test that the user can login with the new password
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
