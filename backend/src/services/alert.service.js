import prisma from '../utils/prisma.js';
import Logger from '../utils/logger.js';

const logger = new Logger('AlertService');

/**
 * Service for managing price alerts
 */
class AlertService {
    /**
     * Create a new price alert
     * @param {string} userId - User ID
     * @param {string} productId - Product ID
     * @param {number} targetPrice - Target price threshold
     * @returns {Promise<Object>} - Created alert
     */
    static async createAlert(userId, productId, targetPrice) {
        try {
            // Verify product belongs to user
            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId
                }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Check if alert already exists
            const existingAlert = await prisma.alert.findFirst({
                where: {
                    userId,
                    productId,
                    active: true
                }
            });

            if (existingAlert) {
                // Update existing alert
                return await prisma.alert.update({
                    where: { id: existingAlert.id },
                    data: {
                        targetPrice,
                        notified: false,
                        notifiedAt: null
                    }
                });
            }

            // Create new alert
            const alert = await prisma.alert.create({
                data: {
                    userId,
                    productId,
                    targetPrice
                }
            });

            logger.info('Alert created', { alertId: alert.id, userId, productId, targetPrice });
            return alert;

        } catch (error) {
            logger.error('Failed to create alert', { userId, productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get all alerts for a user
     * @param {string} userId - User ID
     * @param {boolean} activeOnly - Return only active alerts
     * @returns {Promise<Array>} - User alerts
     */
    static async getUserAlerts(userId, activeOnly = true) {
        try {
            const where = { userId };
            if (activeOnly) {
                where.active = true;
            }

            const alerts = await prisma.alert.findMany({
                where,
                include: {
                    product: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return alerts;

        } catch (error) {
            logger.error('Failed to get user alerts', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Update alert
     * @param {string} alertId - Alert ID
     * @param {string} userId - User ID (for authorization)
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} - Updated alert
     */
    static async updateAlert(alertId, userId, updates) {
        try {
            const alert = await prisma.alert.findFirst({
                where: {
                    id: alertId,
                    userId
                }
            });

            if (!alert) {
                throw new Error('Alert not found');
            }

            const updatedAlert = await prisma.alert.update({
                where: { id: alertId },
                data: updates
            });

            logger.info('Alert updated', { alertId, userId });
            return updatedAlert;

        } catch (error) {
            logger.error('Failed to update alert', { alertId, error: error.message });
            throw error;
        }
    }

    /**
     * Delete alert
     * @param {string} alertId - Alert ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<void>}
     */
    static async deleteAlert(alertId, userId) {
        try {
            const alert = await prisma.alert.findFirst({
                where: {
                    id: alertId,
                    userId
                }
            });

            if (!alert) {
                throw new Error('Alert not found');
            }

            await prisma.alert.delete({
                where: { id: alertId }
            });

            logger.info('Alert deleted', { alertId, userId });

        } catch (error) {
            logger.error('Failed to delete alert', { alertId, error: error.message });
            throw error;
        }
    }

    /**
     * Deactivate alert
     * @param {string} alertId - Alert ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<Object>} - Updated alert
     */
    static async deactivateAlert(alertId, userId) {
        try {
            return await this.updateAlert(alertId, userId, { active: false });
        } catch (error) {
            logger.error('Failed to deactivate alert', { alertId, error: error.message });
            throw error;
        }
    }
}

export default AlertService;
