import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
  role: z.nativeEnum(UserRole).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
  role: z.nativeEnum(UserRole),
});

export const sendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
});

export const verifyResetOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  resetToken: z.string().min(10, 'A valid password reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
});

