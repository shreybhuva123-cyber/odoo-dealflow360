import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { otpService } from '../src/services/otpService.js';
import { emailService } from '../src/services/emailService.js';

test('Email OTP Verification & Zero-Trust Security Test Suite', async (t) => {
  let server;
  const port = 5088;
  const baseUrl = `http://localhost:${port}`;

  await t.test('1. Start test HTTP server', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);
  });

  const testEmail = `sec.test.${Date.now()}@example.com`;

  await t.test('2. OTP generation produces 6 numeric digits', () => {
    const code = otpService.generateCode();
    assert.strictEqual(code.length, 6);
    assert.ok(/^\d{6}$/.test(code));
  });

  await t.test('3. EmailService generates valid HTML template with 6-digit code', () => {
    const html = emailService.generateOtpHtml('user@domain.com', '654321');
    assert.ok(html.includes('654321'));
    assert.ok(html.includes('DealFlow360'));
    assert.ok(html.includes('10 minutes'));
  });

  await t.test('4. POST /api/auth/send-otp creates and dispatches 6-digit OTP', async () => {
    const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, testEmail);
    assert.ok(data.data.expiresAt);
  });

  await t.test('5. POST /api/auth/resend-otp triggers 60-second cooldown (429)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    assert.strictEqual(res.status, 429);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('seconds before requesting a new verification code'));
  });

  await t.test('6. POST /api/auth/verify-otp rejects invalid 6-digit code with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: '000000' }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Incorrect verification code'));
  });

  await t.test('7. POST /api/auth/verify-otp succeeds with correct 6-digit code', async () => {
    const validCode = otpService.getDevOtp(testEmail);
    assert.ok(validCode);
    assert.strictEqual(validCode.length, 6);

    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: validCode }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.verified, true);
  });

  await t.test('8. Single-use policy: re-verifying consumed OTP returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: '123456' }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('No verification code found'));
  });

  await t.test('9. Close test HTTP server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
