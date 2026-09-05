import express from 'express';
import cors from 'cors';
import { getCorsOptions } from './config/corsOptions.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { parameterSanitizer } from './middleware/parameterSanitizer.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { sendSuccess } from './utils/apiResponse.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swaggerSpec.js';
import { testDatabaseConnection } from './config/prisma.js';
import apiRouter from './routes/index.js';

const app = express();

// 1. Security Headers (nosniff, frameguard, CSP, hide fingerprint)
app.use(securityHeaders);

// 2. Enable CORS
app.use(cors(getCorsOptions()));

// 3. Request logging
app.use(requestLogger);

// 4. Body parsing with strict size limits to prevent request flooding
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: false, limit: '500kb' }));

// 5. Parameter sanitization & HTTP Parameter Pollution defense
app.use(parameterSanitizer);

// Swagger API Documentation UI & raw JSON spec
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'DealFlow360 API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root welcome endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, 'Welcome to DealFlow360 API Server', {
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// Root health check endpoint (Liveness probe)
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Database readiness check endpoint (Readiness probe)
app.get('/health/ready', async (req, res) => {
  try {
    const dbStatus = await testDatabaseConnection();
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
});

// Mount Central API router with general rate limiting
app.use('/api', generalRateLimiter, apiRouter);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
