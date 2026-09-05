import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { otpService } from '../src/services/otpService.js';
import { generateResetToken, verifyResetToken } from '../src/utils/jwt.js';

test('Password Reset via Email OTP Verification Test Suite', async (t) => {
  let server;
  const port = 5092;
  const baseUrl = `http://localhost:${port}`;

  await t.test('1. Start test HTTP server', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);
  });

  const testEmail = `reset.test.${Date.now()}@dealflow360.com`;

  await t.test('2. Token utility generates and verifies valid reset JWT', () => {
    const token = generateResetToken(testEmail, '15m');
    assert.ok(token);
    const decoded = verifyResetToken(token);
    assert.strictEqual(decoded.email, testEmail);
    assert.strictEqual(decoded.purpose, 'PASSWORD_RESET');
  });

  await t.test('3. POST /api/auth/forgot-password sends OTP without leaking code in payload', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, testEmail);
    assert.strictEqual(data.data.devOtp, undefined); // Strictly confidential!
    assert.ok(data.data.message);
  });

  await t.test('4. POST /api/auth/forgot-password enforces 60s cooldown (429)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    assert.strictEqual(res.status, 429);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('seconds before requesting a new password reset code'));
  });

  await t.test('5. POST /api/auth/verify-reset-otp rejects invalid 6-digit code with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: '000000' }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Incorrect verification code'));
  });

  let validResetToken;

  await t.test('6. POST /api/auth/verify-reset-otp succeeds with correct code and returns resetToken', async () => {
    const validCode = otpService.getDevOtp(testEmail);
    assert.ok(validCode);
    assert.strictEqual(validCode.length, 6);

    const res = await fetch(`${baseUrl}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: validCode }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.verified, true);
    assert.ok(data.data.resetToken);
    validResetToken = data.data.resetToken;
  });

  await t.test('7. POST /api/auth/reset-password rejects mismatched or forged email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'other.user@dealflow360.com',
        resetToken: validResetToken,
        newPassword: 'BrandNewSecurePassword123!',
      }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('8. POST /api/auth/reset-password succeeds with valid resetToken', async () => {
    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        resetToken: validResetToken,
        newPassword: 'BrandNewSecurePassword123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.message.toLowerCase().includes('password reset'));
  });

  await t.test('9. Close test HTTP server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
