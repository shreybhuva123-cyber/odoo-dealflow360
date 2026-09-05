import morgan from 'morgan';
import { config } from '../config/env.js';

// Custom morgan format for readable request logging
export const requestLogger = morgan(
  config.isProduction
    ? 'combined'
    : ':method :url :status :response-time ms - :res[content-length]'
);
