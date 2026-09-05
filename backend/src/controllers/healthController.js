import { healthService } from '../services/healthService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class HealthController {
  /**
   * Health check endpoint handler
   * GET /api/health
   */
  async getHealth(req, res, next) {
    try {
      const healthData = await healthService.checkHealth();
      return sendSuccess(res, 'DealFlow360 API is running', healthData, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health readiness endpoint handler
   * GET /api/health/ready
   */
  async getReadiness(req, res, next) {
    try {
      const dbStatus = await healthService.checkReadiness();
      if (dbStatus.connected) {
        return res.status(200).json({
          success: true,
          status: 'ready',
          database: 'connected',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(503).json({
        success: false,
        status: 'not_ready',
        database: 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(503).json({
        success: false,
        status: 'not_ready',
        database: 'error',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const healthController = new HealthController();
