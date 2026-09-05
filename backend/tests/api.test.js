import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('Integration Test Suite - DealFlow360 API Foundation', async (t) => {
  let server;
  const port = 5055;
  const baseUrl = `http://localhost:${port}`;

  await t.test('Server starts successfully', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);
  });

  await t.test('GET /api/health returns HTTP 200 with standard response structure', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'DealFlow360 API is running');
    assert.ok(data.timestamp);
    assert.ok(data.data);
    assert.strictEqual(typeof data.data.uptime, 'number');
    assert.ok(data.data.database);
  });

  await t.test('GET / returns root welcome message', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Welcome to DealFlow360 API Server');
  });

  await t.test('Invalid route returns HTTP 404 with centralized error response', async () => {
    const res = await fetch(`${baseUrl}/api/invalid-route-does-not-exist`);
    assert.strictEqual(res.status, 404);

    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'NotFoundError');
    assert.ok(data.message.includes('not found'));
    assert.ok(data.timestamp);
  });

  await t.test('Malformed JSON payload returns HTTP 400 via error middleware', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalidJson": ',
    });
    assert.strictEqual(res.status, 400);

    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'MalformedJSON');
    assert.ok(data.timestamp);
  });

  await t.test('Close test server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
