import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, sanitizeUser } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { UserRole } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user safely
   * Public registration enforces SALES_REP role to prevent privilege escalation.
   * @param {{ name: string, email: string, password: string, role?: UserRole }} data
   * @param {boolean} [isPublic=true]
   */
  async registerUser(data, isPublic = true) {
    const email = data.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    // Role safety policy: public registrations are strictly SALES_REP
    const role = isPublic ? UserRole.SALES_REP : (data.role || UserRole.SALES_REP);

    // Hash plain-text password
    const passwordHash = await hashPassword(data.password);

    // Persist user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return sanitizeUser(newUser);
  }

  /**
   * Authenticate a user by credentials and issue JWT
   * @param {string} email
   * @param {string} password
   */
  async loginUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic error to avoid email enumeration
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('User account is deactivated. Please contact an administrator.', 401);
    }

    // Verify password hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT access token
    const token = generateAccessToken(user);

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  /**
   * Retrieve current authenticated user profile
   * @param {string} userId
   */
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    return sanitizeUser(user);
  }

  /**
   * Administrative creation of internal staff with specific roles
   * @param {{ name: string, email: string, password: string, role: UserRole }} data
   */
  async adminCreateUser(data) {
    return this.registerUser(data, false);
  }
}

export const authService = new AuthService();
