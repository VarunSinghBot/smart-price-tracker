import prisma from '../utils/prisma.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ProductService');

/**
 * Service for product management operations
 */
class ProductService {
    /**
     * Get all products for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options (pagination, filters)
     * @returns {Promise<Object>} - Products and metadata
     */
    static async getUserProducts(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                platform,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const skip = (page - 1) * limit;

            const where = { userId };
            if (platform) {
                where.platform = platform;
            }

            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        _count: {
                            select: { alerts: true }
                        }
                    }
                }),
                prisma.product.count({ where })
            ]);

            return {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            logger.error('Failed to get user products', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Get product by ID
     * @param {string} productId - Product ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<Object>} - Product data
     */
    static async getProductById(productId, userId) {
        try {
            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId
                },
                include: {
                    priceHistory: {
                        orderBy: { scrapedAt: 'desc' },
                        take: 100
                    },
                    alerts: true
                }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            return product;

        } catch (error) {
            logger.error('Failed to get product', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Delete product
     * @param {string} productId - Product ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<void>}
     */
    static async deleteProduct(productId, userId) {
        try {
            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId
                }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            await prisma.product.delete({
                where: { id: productId }
            });

            logger.info('Product deleted', { productId, userId });

        } catch (error) {
            logger.error('Failed to delete product', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get price history for a product
     * @param {string} productId - Product ID
     * @param {string} userId - User ID (for authorization)
     * @param {number} days - Number of days of history
     * @returns {Promise<Array>} - Price history
     */
    static async getPriceHistory(productId, userId, days = 30) {
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

            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - days);

            const history = await prisma.priceHistory.findMany({
                where: {
                    productId,
                    scrapedAt: {
                        gte: dateFrom
                    }
                },
                orderBy: { scrapedAt: 'asc' }
            });

            return history;

        } catch (error) {
            logger.error('Failed to get price history', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get products grouped by platform
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Products grouped by platform
     */
    static async getProductsByPlatform(userId) {
        try {
            const products = await prisma.product.findMany({
                where: { userId },
                select: {
                    platform: true,
                    id: true
                }
            });

            const grouped = products.reduce((acc, product) => {
                if (!acc[product.platform]) {
                    acc[product.platform] = 0;
                }
                acc[product.platform]++;
                return acc;
            }, {});

            return grouped;

        } catch (error) {
            logger.error('Failed to group products by platform', { userId, error: error.message });
            throw error;
        }
    }
}

export default ProductService;
