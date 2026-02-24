import { Router } from 'express';
import {
    getUserProducts,
    getProductById,
    deleteProduct,
    getPriceHistory,
    getProductsByPlatform
} from '../controllers/product.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate, productSchemas } from '../middlewares/validation.middleware.js';

const router = Router();

// All product routes require authentication
router.use(verifyJWT);

/**
 * @route GET /api/v1/products
 * @desc Get all products for authenticated user
 * @access Private
 */
router.get('/', getUserProducts);

/**
 * @route GET /api/v1/products/stats/by-platform
 * @desc Get products grouped by platform
 * @access Private
 */
router.get('/stats/by-platform', getProductsByPlatform);

/**
 * @route GET /api/v1/products/:productId
 * @desc Get product by ID with details
 * @access Private
 */
router.get(
    '/:productId',
    validate({ params: productSchemas.productId }),
    getProductById
);

/**
 * @route GET /api/v1/products/:productId/price-history
 * @desc Get price history for a product
 * @access Private
 */
router.get(
    '/:productId/price-history',
    validate({
        params: productSchemas.productId,
        query: productSchemas.getPriceHistory
    }),
    getPriceHistory
);

/**
 * @route DELETE /api/v1/products/:productId
 * @desc Delete a product
 * @access Private
 */
router.delete(
    '/:productId',
    validate({ params: productSchemas.productId }),
    deleteProduct
);

export default router;
