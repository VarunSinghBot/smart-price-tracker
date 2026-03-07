import { Router } from 'express';
import {
    scrapeProduct,
    updateProductPrice,
    bulkUpdateProducts,
    getSupportedPlatforms,
    scrapeMultiPlatform,
    searchCrossPlatform
} from '../controllers/scraper.controller.js';
import {
    findSimilarProducts,
    getSupportedPlatformsForSearch
} from '../controllers/productMatcher.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate, productSchemas } from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @route GET /api/v1/scraper/supported-platforms
 * @desc Get list of supported e-commerce platforms
 * @access Public
 */
router.get('/supported-platforms', getSupportedPlatforms);

/**
 * @route GET /api/v1/scraper/supported-platforms-search
 * @desc Get platforms that support advanced search and matching
 * @access Public
 */
router.get('/supported-platforms-search', getSupportedPlatformsForSearch);

// Authentication required for scraping operations
router.use(verifyJWT);

/**
 * @route POST /api/v1/scraper/scrape
 * @desc Scrape a product from URL and add to tracking
 * @access Private
 */
router.post(
    '/scrape',
    validate({ body: productSchemas.scrapeProduct }),
    scrapeProduct
);

/**
 * @route POST /api/v1/scraper/update/:productId
 * @desc Manually update product price by re-scraping
 * @access Private
 */
router.post(
    '/update/:productId',
    validate({ params: productSchemas.productId }),
    updateProductPrice
);

/**
 * @route POST /api/v1/scraper/bulk-update
 * @desc Bulk update products (for admin or scheduled tasks)
 * @access Private
 * @note In production, this should be restricted to admin users only
 */
router.post('/bulk-update', bulkUpdateProducts);

/**
 * @route POST /api/v1/scraper/scrape-multi-platform
 * @desc Scrape same product from multiple platforms (preview only, doesn't save)
 * @access Private
 */
router.post('/scrape-multi-platform', scrapeMultiPlatform);

/**
 * @route POST /api/v1/scraper/search-cross-platform
 * @desc Search and scrape similar products on other platforms using product title
 * @access Private
 */
router.post('/search-cross-platform', searchCrossPlatform);

/**
 * @route POST /api/v1/scraper/find-similar
 * @desc Find the SAME product across platforms using image & text similarity matching
 * @access Private
 */
router.post('/find-similar', findSimilarProducts);

export default router;
