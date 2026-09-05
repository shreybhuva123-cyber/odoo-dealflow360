import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { signupSchema, SignupFormData } from '@/lib/validations/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Layers, ArrowRight, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [signupError, setSignupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'SALES_REP',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setSignupError(null);
    try {
      const response = await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      login(response.user, response.tokens.accessToken, response.tokens.refreshToken);

      if (response.user.role === 'CUSTOMER') {
        navigate(ROUTES.PORTAL.QUOTE('portal_apex_1001_secure'), { replace: true });
      } else {
        navigate(ROUTES.APP.DASHBOARD, { replace: true });
      }
    } catch (err: any) {
      setSignupError(err.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-1">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create DealFlow Account</h1>
          <p className="text-xs font-medium text-muted-foreground">Register your role & organization in DealFlow360</p>
        </div>

        <Card className="border-border/80 bg-card shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-semibold">User Registration</CardTitle>
            <CardDescription className="text-xs">
              Configure your profile credentials and demo role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {signupError && (
              <Alert variant="destructive" className="text-xs">
                {signupError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <Input
                  {...register('name')}
                  type="text"
                  placeholder="Elena Rostova"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Work Email</label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="elena@dealflow360.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Password</label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Confirm Password</label>
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                />
              </div>

              {/* Role Selection (Hackathon Demo / Assignment) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Assign Role (Demo Select)</label>
                  <span className="text-[10px] text-muted-foreground font-mono">Hackathon Persona</span>
                </div>
                <Select
                  {...register('role')}
                  options={[
                    { label: 'Sales Representative', value: 'SALES_REP' },
                    { label: 'Sales Manager', value: 'SALES_MANAGER' },
                    { label: 'Administrator', value: 'ADMIN' },
                    { label: 'Finance & Invoicing', value: 'FINANCE' },
                    { label: 'Warehouse & Logistics Ops', value: 'WAREHOUSE_OPS' },
                    { label: 'Customer (Restricted Portal)', value: 'CUSTOMER' },
                  ]}
                  error={errors.role?.message}
                />
              </div>

              <Button
                type="submit"
                className="w-full text-xs font-semibold h-10 mt-2 shadow-md shadow-primary/20"
                isLoading={isSubmitting}
              >
                Complete Registration
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/40 py-3">
            Already have an account?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="text-primary hover:underline ml-1 font-semibold">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
