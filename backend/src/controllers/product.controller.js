import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ProductService from '../services/product.service.js';

/**
 * Controller for product management operations
 */

/**
 * @route GET /api/v1/products
 * @desc Get all products for authenticated user
 */
const getUserProducts = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const {
        page = 1,
        limit = 20,
        platform,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const result = await ProductService.getUserProducts(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        platform,
        sortBy,
        sortOrder
    });

    return res.status(200).json(
        new ApiResponse(200, result, 'Products retrieved successfully')
    );
});

/**
 * @route GET /api/v1/products/:productId
 * @desc Get product by ID with price history
 */
const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const product = await ProductService.getProductById(productId, userId);

    return res.status(200).json(
        new ApiResponse(200, product, 'Product retrieved successfully')
    );
});

/**
 * @route DELETE /api/v1/products/:productId
 * @desc Delete a product
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    await ProductService.deleteProduct(productId, userId);

    return res.status(200).json(
        new ApiResponse(200, null, 'Product deleted successfully')
    );
});

/**
 * @route GET /api/v1/products/:productId/price-history
 * @desc Get price history for a product
 */
const getPriceHistory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const history = await ProductService.getPriceHistory(
        productId,
        userId,
        parseInt(days)
    );

    return res.status(200).json(
        new ApiResponse(200, history, 'Price history retrieved successfully')
    );
});

/**
 * @route GET /api/v1/products/stats/by-platform
 * @desc Get products grouped by platform
 */
const getProductsByPlatform = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const stats = await ProductService.getProductsByPlatform(userId);

    return res.status(200).json(
        new ApiResponse(200, stats, 'Product statistics retrieved successfully')
    );
});

export {
    getUserProducts,
    getProductById,
    deleteProduct,
    getPriceHistory,
    getProductsByPlatform
};
