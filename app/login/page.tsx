'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '@/lib/store/slices/authSlice';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Add schema for register
const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    role: z.enum(['trainer', 'member'], {
      message: 'Please select a user type',
    }),
    organizationId: z.string().optional(),
    familyId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (
        data.role === 'trainer' &&
        (!data.organizationId || data.organizationId.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Organization ID is required for trainers',
      path: ['organizationId'],
    }
  )
  .refine(
    (data) => {
      if (
        data.role === 'member' &&
        (!data.familyId || data.familyId.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Family ID is required for members',
      path: ['familyId'],
    }
  );

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'member',
      organizationId: '',
      familyId: '',
    },
  });

  const [registerLoading, setRegisterLoading] = useState(false);

  // Handle redirect after successful authentication
  useEffect(() => {
    console.log('LoginPage - Redirect effect triggered:', {
      shouldRedirect,
      redirectPath,
      isAuthenticated,
      userRole: user?.role,
      user: user,
    });

    if (shouldRedirect && redirectPath && isAuthenticated && user) {
      console.log('LoginPage - Redirecting to:', redirectPath);
      router.replace(redirectPath);
      setShouldRedirect(false);
      setRedirectPath('');
    }
  }, [shouldRedirect, redirectPath, isAuthenticated, user, router]);

  const onSubmit = async (values: LoginForm) => {
    dispatch(loginStart());

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Backend response:', data);
      const token = data.data.token; // Adjust based on actual response structure
      const user = data.data.user.user; // Fix: extract user from nested structure
      console.log('Extracted user:', user);
      console.log('User role from backend:', user?.role);

      // Pass remember me preference to the login action
      // Token storage is now handled by middleware
      dispatch(loginSuccess({ user, token, rememberMe: values.remember }));

      // Add debugging
      console.log('Login successful - User role:', user.role);
      console.log('About to redirect admin user to /admin');

      // Set redirect state instead of immediately redirecting
      if (user.role === 'admin') {
        console.log('Setting redirect to /admin');
        setRedirectPath('/admin');
        setShouldRedirect(true);
      } else {
        console.log('Setting redirect to /guest');
        setRedirectPath('/guest');
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(
        loginFailure(error instanceof Error ? error.message : 'Login failed')
      );
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setRegisterLoading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

      // Determine the correct endpoint based on role
      let endpoint = '';
      const requestBody: {
        name: string;
        email: string;
        password: string;
        organization_id?: string;
        family_id?: string;
      } = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      switch (values.role) {
        case 'trainer':
          endpoint = '/auth/register/trainer';
          if (values.organizationId) {
            requestBody.organization_id = values.organizationId;
          }
          break;
        case 'member':
          endpoint = '/auth/register/member';
          if (values.familyId) {
            requestBody.family_id = values.familyId;
          }
          break;
        default:
          throw new Error('Invalid user role');
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration backend response:', data);
      const token = data.data.token;
      const user = data.data.user.user; // Fix: extract user from nested structure
      console.log('Registration extracted user:', user);
      console.log('Registration user role from backend:', user?.role);

      // Store token (assuming remember false for new user)
      sessionStorage.setItem('authToken', token);
      dispatch(loginSuccess({ user, token }));

      // Add debugging
      console.log('Registration successful - User role:', user.role);
      console.log('About to redirect admin user to /admin');

      // Set redirect state instead of immediately redirecting
      if (user.role === 'admin') {
        console.log('Setting redirect to /admin');
        setRedirectPath('/admin');
        setShouldRedirect(true);
      } else {
        console.log('Setting redirect to /guest');
        setRedirectPath('/guest');
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error(error);
      dispatch(
        loginFailure(
          error instanceof Error ? error.message : 'Registration failed'
        )
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col pb-24">
        {/* Fixed Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Image
              src="/CC-logo-notag.jpg"
              alt="Compassion & Choices"
              className="h-10 w-auto"
              width={40}
              height={40}
              priority
            />
            <ThemeToggle />
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 mt-16">
          {/* Left column */}
          <div
            className="relative flex items-center justify-center p-8 text-white"
            style={{
              backgroundImage: `url('/empowerment.svg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 text-center">
              <h1 className="text-4xl font-bold mb-4">
                Your Roadmap to Empowerment
              </h1>
              <p className="text-xl">
                Navigate your journey with our interactive{' '}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline cursor-help">stops</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Interactive points where you can learn, engage, and grow.
                    </p>
                  </TooltipContent>
                </Tooltip>{' '}
                along the way.
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="flex items-center justify-center p-8 bg-background">
            <Card className="w-full max-w-md shadow-lg">
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                    {error}
                  </div>
                )}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword
                                    ? 'Hide password'
                                    : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-start">
                      <FormField
                        control={form.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full uppercase"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="register">
                    <AccordionTrigger>Create an Account</AccordionTrigger>
                    <AccordionContent>
                      <Form {...registerForm}>
                        <form
                          onSubmit={registerForm.handleSubmit(handleRegister)}
                          className="space-y-4"
                        >
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="your@email.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>User Type</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="member"
                                        value="member"
                                        checked={field.value === 'member'}
                                        onChange={() =>
                                          field.onChange('member')
                                        }
                                        className="text-primary"
                                      />
                                      <label
                                        htmlFor="member"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        Member
                                      </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="trainer"
                                        value="trainer"
                                        checked={field.value === 'trainer'}
                                        onChange={() =>
                                          field.onChange('trainer')
                                        }
                                        className="text-primary"
                                      />
                                      <label
                                        htmlFor="trainer"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        Trainer
                                      </label>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Conditional Organization ID field for trainers */}
                          {registerForm.watch('role') === 'trainer' && (
                            <FormField
                              control={registerForm.control}
                              name="organizationId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Organization UUID</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter organization UUID"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {/* Conditional Family ID field for members */}
                          {registerForm.watch('role') === 'member' && (
                            <FormField
                              control={registerForm.control}
                              name="familyId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Family UUID</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter family UUID"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="confirm password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={registerLoading}
                          >
                            {registerLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              'Register'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button variant="secondary" asChild className="mt-4">
                  <Link href="/guest">Explore as Guest</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
