import test from 'node:test';
import assert from 'node:assert';
import { healthService } from '../src/services/healthService.js';

test('HealthService returns a valid status object', async () => {
  const health = await healthService.checkHealth();
  assert.ok(health);
  assert.ok(['healthy', 'degraded'].includes(health.status));
  assert.strictEqual(typeof health.uptime, 'number');
  assert.ok(health.database);
});
