import { prisma } from '../config/prisma.js';
import { logger } from './logger.js';

/**
 * Reusable audit logging utility
 * @param {{
 *   userId?: string,
 *   entityType: string,
 *   entityId: string,
 *   action: string,
 *   oldValue?: any,
 *   newValue?: any,
 *   reason?: string
 * }} entry
 */
export async function recordAuditLog(entry) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        oldValue: entry.oldValue !== undefined ? entry.oldValue : null,
        newValue: entry.newValue !== undefined ? entry.newValue : null,
        reason: entry.reason || null,
      },
    });
  } catch (err) {
    // Audit log failure should be logged but never crash the core business transaction
    logger.error('Failed to write audit log entry:', err);
    return null;
  }
}
