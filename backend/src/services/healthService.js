import { testDatabaseConnection } from '../config/prisma.js';
import { config } from '../config/env.js';

export class HealthService {
  /**
   * Retrieves overall system and database health
   */
  async checkHealth() {
    const dbStatus = await testDatabaseConnection();

    return {
      status: dbStatus.connected ? 'healthy' : 'degraded',
      environment: config.nodeEnv,
      uptime: process.uptime(),
      database: dbStatus,
    };
  }

  /**
   * Checks database readiness for handling live traffic
   */
  async checkReadiness() {
    return testDatabaseConnection();
  }
}

export const healthService = new HealthService();
