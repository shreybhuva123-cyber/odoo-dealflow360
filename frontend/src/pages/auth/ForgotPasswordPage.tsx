import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Lock, Eye, EyeOff, KeyRound, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { authApi } from '@/services/api/auth.api';
import { showToast } from '@/stores/toast.store';
import { ROUTES } from '@/constants/routes';

type ResetStep = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard flow state
  const [step, setStep] = useState<ResetStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & timing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Success auto-redirect timer
  useEffect(() => {
    if (step !== 'SUCCESS') return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(ROUTES.AUTH.LOGIN, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, navigate]);

  // Focus digit box on OTP step
  useEffect(() => {
    if (step === 'OTP' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // STEP 1: Request Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setCooldown(60);
      setStep('OTP');
      showToast('Verification code dispatched to your email', 'blue');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Digit Input Handlers
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return; // Digits only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const fullOtpCode = digits.join('');

  // STEP 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullOtpCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authApi.verifyResetOtp(email.trim().toLowerCase(), fullOtpCode);
      setResetToken(res.resetToken);
      setStep('NEW_PASSWORD');
      showToast('Email verified! You may now set a new password.', 'green');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect verification code. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setCooldown(60);
      setSuccessMessage('A fresh 6-digit verification code was sent to your email.');
      showToast('A fresh reset code was sent to your email', 'blue');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
    }
  };

  // STEP 3: Submit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });

      setStep('SUCCESS');
      showToast('Password reset successfully!', 'green');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The reset session may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-blue-600 selection:text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-1">
            {step === 'SUCCESS' ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            ) : step === 'NEW_PASSWORD' ? (
              <Lock className="h-6 w-6" />
            ) : (
              <KeyRound className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === 'EMAIL' && 'Reset Your Password'}
            {step === 'OTP' && 'Verify Your Email'}
            {step === 'NEW_PASSWORD' && 'Create New Password'}
            {step === 'SUCCESS' && 'Password Changed!'}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            {step === 'EMAIL' && 'Enter your work email to receive a 6-digit reset code'}
            {step === 'OTP' && 'Enter the 6-digit passcode sent to your inbox'}
            {step === 'NEW_PASSWORD' && 'Set a new strong password for your DealFlow360 account'}
            {step === 'SUCCESS' && 'Your account security credentials have been updated'}
          </p>
        </div>

        <Card className="border-border/80 bg-card shadow-2xl">
          {/* STEP 1: Enter Email */}
          {step === 'EMAIL' && (
            <>
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-base font-semibold">Account Recovery</CardTitle>
                <CardDescription className="text-xs">
                  We'll send an automated 6-digit security OTP to verify identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive" className="text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </Alert>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Work Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-border/80 bg-muted/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs font-semibold h-11 shadow-md shadow-primary/20"
                    isLoading={isSubmitting}
                  >
                    Send Verification Code
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* STEP 2: Verify 6-digit OTP */}
          {step === 'OTP' && (
            <>
              <CardHeader className="space-y-1 pb-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{email}</span>
                </div>
                <CardDescription className="text-xs pt-1">
                  Valid for 10 minutes. Code is delivered strictly to your email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {errorMessage && (
                  <Alert variant="destructive" className="text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="text-xs flex items-center gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </Alert>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-border/80 bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs font-semibold h-11 shadow-md shadow-primary/20"
                    isLoading={isSubmitting}
                    disabled={fullOtpCode.length !== 6}
                  >
                    Verify & Proceed
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>

                {/* Resend Action */}
                <div className="text-center pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                    <span>
                      {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Didn't receive code? Resend OTP"}
                    </span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <Inbox className="h-3 w-3" />
                    <span>Can't find the email? Check your Spam or Promotions folder.</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 3: Create New Password */}
          {step === 'NEW_PASSWORD' && (
            <>
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-base font-semibold">New Security Credentials</CardTitle>
                <CardDescription className="text-xs">
                  Email identity verified. Please choose a strong new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive" className="text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </Alert>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                        className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-border/80 bg-muted/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                        className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-border/80 bg-muted/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs font-semibold h-11 shadow-md shadow-primary/20"
                    isLoading={isSubmitting}
                  >
                    Update Password
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* STEP 4: Success State */}
          {step === 'SUCCESS' && (
            <CardContent className="space-y-5 pt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">Password Successfully Reset</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your new password is now active. You will be redirected to the sign in page in {redirectCountdown} seconds.
                </p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.AUTH.LOGIN, { replace: true })}
                className="w-full text-xs font-semibold h-11"
              >
                Sign In Now
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardContent>
          )}

          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/40 py-3">
            Remember your password?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="text-primary hover:underline ml-1 font-semibold">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
