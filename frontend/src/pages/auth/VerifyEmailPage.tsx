import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/stores/toast.store';
import { ROUTES } from '@/constants/routes';

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dealflow_verify_email') || '' : '';
  const stateEmail = location.state?.email || storedEmail;
  const stateRole = location.state?.role || 'SALES_REP';
  const stateUser = location.state?.user || null;

  const [email, setEmail] = useState<string>(stateEmail);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Persist email in sessionStorage so page reload does not lose state
  useEffect(() => {
    if (email) {
      sessionStorage.setItem('dealflow_verify_email', email);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const paramEmail = searchParams.get('email');
      if (paramEmail) {
        setEmail(paramEmail);
        sessionStorage.setItem('dealflow_verify_email', paramEmail);
      }
    }
  }, [email, location.search]);

  // Focus the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Live countdown timer for resend OTP cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return; // Digits only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous box on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const fullCode = digits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApi.verifyOtp(email, fullCode);

      setSuccessMessage('Email verified successfully! Preparing your workspace...');
      showToast('Email verified successfully!', 'green');

      // If user profile returned from API, activate session
      if (result.user && result.token) {
        login(result.user, result.token);
      } else if (stateUser) {
        login(stateUser, `jwt-verified-token-${stateRole.toLowerCase()}`);
      }

      setTimeout(() => {
        if (stateRole === 'CUSTOMER' || result.user?.role === 'CUSTOMER') {
          navigate(ROUTES.PORTAL.QUOTE('portal_apex_1001_secure'), { replace: true });
        } else {
          navigate(ROUTES.APP.DASHBOARD, { replace: true });
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect verification code. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authApi.resendOtp(email);
      setCooldown(60);
      setSuccessMessage('A fresh 6-digit verification code has been dispatched to your email.');
      showToast('Verification code sent to your email inbox', 'blue');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-blue-600 selection:text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-1">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Your Email</h1>
          <p className="text-xs font-medium text-muted-foreground">
            Enter the 6-digit one-time passcode (OTP) sent to your inbox
          </p>
        </div>

        <Card className="border-border/80 bg-card shadow-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium">
              <Mail className="h-3.5 w-3.5" />
              <span>{email || 'your registered email'}</span>
            </div>
            <CardDescription className="text-xs pt-1">
              Valid for 10 minutes. Check your spam folder if you do not see it.
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

            <form onSubmit={handleVerify} className="space-y-5">
              {/* 6-box OTP input */}
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-xs font-semibold h-11 shadow-md shadow-primary/20"
                isLoading={isSubmitting}
                disabled={fullCode.length !== 6 || !!successMessage}
              >
                Verify & Continue
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            {/* Resend Action */}
            <div className="text-center pt-2 space-y-2">
              <button
                type="button"
                onClick={handleResend}
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

          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/40 py-3">
            Wrong email address?{' '}
            <Link to={ROUTES.AUTH.SIGNUP} className="text-primary hover:underline ml-1 font-semibold">
              Change email
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
