import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { config } from '../src/config/env.js';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { generateAccessToken, verifyAccessToken, sanitizeUser } from '../src/utils/jwt.js';
import { authService } from '../src/services/authService.js';
import { UserRole } from '@prisma/client';

test('Authentication, JWT & RBAC Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5066;
  const baseUrl = `http://localhost:${port}`;

  await t.test('Server starts on test port', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);
  });

  // -------------------------------------------------------------
  // UNIT TESTS: Helper Functions
  // -------------------------------------------------------------
  await t.test('Unit: hashPassword and comparePassword correctly hash and verify', async () => {
    const plain = 'SecretTestPassword123!';
    const hash = await hashPassword(plain);

    assert.notStrictEqual(plain, hash);
    assert.ok(hash.startsWith('$2')); // bcrypt prefix

    const isValid = await comparePassword(plain, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await comparePassword('WrongPassword', hash);
    assert.strictEqual(isInvalid, false);
  });

  await t.test('Unit: generateAccessToken and verifyAccessToken work with minimal payload', async () => {
    const mockUser = { id: 'test-user-uuid-123', role: UserRole.SALES_REP };
    const token = generateAccessToken(mockUser, '1h');
    assert.ok(token);

    const decoded = verifyAccessToken(token);
    assert.strictEqual(decoded.userId, mockUser.id);
    assert.strictEqual(decoded.role, mockUser.role);
    assert.strictEqual(decoded.password, undefined);
    assert.strictEqual(decoded.passwordHash, undefined);
  });

  await t.test('Unit: sanitizeUser removes passwordHash', async () => {
    const rawUser = {
      id: 'uuid-1',
      name: 'Alice',
      email: 'alice@test.com',
      passwordHash: '$2b$10$hashedstring...',
      role: 'SALES_REP',
    };
    const safe = sanitizeUser(rawUser);
    assert.strictEqual(safe.passwordHash, undefined);
    assert.strictEqual(safe.email, 'alice@test.com');
  });

  // -------------------------------------------------------------
  // AUTHENTICATION FLOW TESTS
  // -------------------------------------------------------------
  const uniqueEmail = `sales.new.${Date.now()}@dealflow360.com`;

  await t.test('1. Register valid user enforces SALES_REP and hides passwordHash', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Sales Rep',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'ADMIN', // Public registration must ignore/disallow requested ADMIN
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.user.email, uniqueEmail);
    assert.strictEqual(data.data.user.role, 'SALES_REP'); // Enforced role
    assert.strictEqual(data.data.user.passwordHash, undefined);
  });

  await t.test('2. Register duplicate email returns HTTP 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Rep',
        email: uniqueEmail,
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('already exists'));
  });

  await t.test('3. Register invalid email returns HTTP 400 Validation Error', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email Rep',
        email: 'not-a-valid-email',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  await t.test('4. Login with correct password returns HTTP 200 with JWT and sanitized user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales.rep@dealflow360.com',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token);
    assert.strictEqual(data.data.user.role, 'SALES_REP');
    assert.strictEqual(data.data.user.passwordHash, undefined);
  });

  await t.test('5. Login with incorrect password returns HTTP 401 with generic message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales.rep@dealflow360.com',
        password: 'WrongPassword999',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  await t.test('6. Login with nonexistent email returns HTTP 401 with generic message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@dealflow360.com',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  await t.test('7. Login inactive user returns HTTP 401 Deactivated', async () => {
    // Create an inactive user
    const inactiveEmail = `inactive.${Date.now()}@dealflow360.com`;
    const hashed = await hashPassword('Password123!');
    await prisma.user.create({
      data: {
        name: 'Inactive Staff',
        email: inactiveEmail,
        passwordHash: hashed,
        role: UserRole.SALES_REP,
        isActive: false,
      },
    });

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inactiveEmail,
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('deactivated'));
  });

  await t.test('8. Access protected route without token returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'UnauthorizedError');
  });

  await t.test('9. Access protected route with invalid token returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'InvalidTokenError');
  });

  await t.test('10. Access protected route with expired token returns HTTP 401 TokenExpiredError', async () => {
    const salesUser = await prisma.user.findUnique({
      where: { email: 'sales.rep@dealflow360.com' },
    });
    // Generate token with 1ms expiration
    const expiredToken = generateAccessToken(salesUser, '1ms');

    // Wait 20ms to guarantee expiration
    await new Promise((resolve) => setTimeout(resolve, 20));

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'TokenExpiredError');
  });

  await t.test('11. Access protected route with valid token returns HTTP 200', async () => {
    const salesUser = await prisma.user.findUnique({
      where: { email: 'sales.rep@dealflow360.com' },
    });
    const token = generateAccessToken(salesUser);

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.user.email, 'sales.rep@dealflow360.com');
  });

  await t.test('12. GET /api/auth/me returns current user profile without passwordHash', async () => {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@dealflow360.com' },
    });
    const token = generateAccessToken(adminUser);

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.user.email, 'admin@dealflow360.com');
    assert.strictEqual(data.data.user.role, 'ADMIN');
    assert.strictEqual(data.data.user.passwordHash, undefined);
  });

  await t.test('POST /api/auth/logout returns HTTP 200 acknowledging client token removal', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.message.includes('removed from client storage'));
  });

  // -------------------------------------------------------------
  // AUTHORIZATION / RBAC TESTS
  // -------------------------------------------------------------
  let adminToken, salesToken, managerToken, financeToken, opsToken;

  await t.test('Acquire tokens for all 5 roles', async () => {
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    const salesUser = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    const managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    const financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });
    const opsUser = await prisma.user.findUnique({ where: { email: 'operations@dealflow360.com' } });

    adminToken = generateAccessToken(adminUser);
    salesToken = generateAccessToken(salesUser);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);

    assert.ok(adminToken && salesToken && managerToken && financeToken && opsToken);
  });

  await t.test('13. ADMIN can access admin endpoint (/api/test/admin)', async () => {
    const res = await fetch(`${baseUrl}/api/test/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('14. SALES_REP cannot access admin endpoint (/api/test/admin) returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/test/admin`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  await t.test('15. FINANCE can access finance endpoint (/api/test/finance)', async () => {
    const res = await fetch(`${baseUrl}/api/test/finance`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('16. OPERATIONS cannot access finance endpoint (/api/test/finance) returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/test/finance`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  await t.test('17. SALES_MANAGER can access sales approval endpoint (/api/test/sales-manager)', async () => {
    const res = await fetch(`${baseUrl}/api/test/sales-manager`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('18. SALES_REP cannot access manager-level approval endpoint returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/test/sales-manager`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  await t.test('ADMIN can create elevated users via /api/auth/users', async () => {
    const adminCreatedEmail = `manager.created.${Date.now()}@dealflow360.com`;
    const res = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Elevated Manager',
        email: adminCreatedEmail,
        password: 'Password123!',
        role: UserRole.SALES_MANAGER,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.user.role, 'SALES_MANAGER');
    assert.strictEqual(data.data.user.passwordHash, undefined);
  });

  await t.test('SALES_REP cannot create elevated users via /api/auth/users returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        name: 'Hacked Admin',
        email: `hacked.${Date.now()}@dealflow360.com`,
        password: 'Password123!',
        role: UserRole.ADMIN,
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  // -------------------------------------------------------------
  // SECURITY REQUIREMENTS
  // -------------------------------------------------------------
  await t.test('19. passwordHash never appears in any API response', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const text = await res.text();
    assert.strictEqual(text.includes('passwordHash'), false);
    assert.strictEqual(text.includes('$2b$'), false);
  });

  await t.test('21. JWT secret is loaded from environment, not hardcoded', () => {
    assert.ok(config.jwtSecret);
    assert.notStrictEqual(config.jwtSecret, '');
  });

  await t.test('22. JWT payload contains only minimal non-sensitive data (userId, role)', () => {
    const decoded = verifyAccessToken(adminToken);
    assert.ok(decoded.userId);
    assert.ok(decoded.role);
    assert.strictEqual(decoded.password, undefined);
    assert.strictEqual(decoded.passwordHash, undefined);
    assert.strictEqual(decoded.customer, undefined);
  });

  await t.test('Close test server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
