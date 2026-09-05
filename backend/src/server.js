import app from './app.js';
import { config } from './config/env.js';
import { prisma, testDatabaseConnection } from './config/prisma.js';
import { logger } from './utils/logger.js';

let server;

async function startServer() {
  try {
    // Check database connectivity
    logger.info('Connecting to PostgreSQL database...');
    const dbStatus = await testDatabaseConnection();

    if (dbStatus.connected) {
      logger.info('✅ ' + dbStatus.message);
    } else {
      logger.warn('⚠️ ' + dbStatus.message);
      logger.warn('⚠️ Ensure DATABASE_URL in .env is valid and PostgreSQL is running.');
    }

    // Start Express server
    server = app.listen(config.port, () => {
      logger.info(`🚀 DealFlow360 API Server running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Health Check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected.');
      } catch (err) {
        logger.error('Error disconnecting Prisma:', err);
      }
      process.exit(0);
    });

    // Force shutdown if taking too long
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  gracefulShutdown('uncaughtException');
});

startServer();
