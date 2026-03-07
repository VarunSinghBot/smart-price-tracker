import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ProductMatcherService from '../services/productMatcher.service.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ProductMatcherController');

/**
 * Find similar products across platforms
 * @route POST /api/v1/scraper/find-similar
 * @access Private
 */
const findSimilarProducts = asyncHandler(async (req, res) => {
    const { url, platforms, limit, minConfidence } = req.body;

    // Validate URL
    if (!url) {
        throw new ApiError(400, 'Product URL is required');
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        throw new ApiError(400, 'Invalid URL format');
    }

    logger.info('Find similar products request', { 
        userId: req.user?.id,
        url, 
        platforms 
    });

    // Search for similar products
    const results = await ProductMatcherService.findSimilarProducts(
        url,
        platforms,
        {
            limit: limit || 5,
            minConfidence: minConfidence || 70,
        }
    );

    // Add match quality labels
    results.matches = results.matches.map(match => ({
        ...match,
        matchQuality: ProductMatcherService.getMatchQuality(match.confidence),
    }));

    logger.info('Similar products found', { 
        totalMatches: results.totalMatches 
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            results,
            `Found ${results.totalMatches} similar products across ${results.platformsSearched.length} platforms`
        )
    );
});

/**
 * Get supported platforms for cross-platform search
 * @route GET /api/v1/scraper/supported-platforms-search
 * @access Public
 */
const getSupportedPlatformsForSearch = asyncHandler(async (req, res) => {
    const platforms = [
        {
            name: 'Amazon',
            key: 'amazon',
            baseUrl: 'https://www.amazon.in',
            searchSupported: true,
        },
        {
            name: 'Flipkart',
            key: 'flipkart',
            baseUrl: 'https://www.flipkart.com',
            searchSupported: true,
        },
        {
            name: 'eBay',
            key: 'ebay',
            baseUrl: 'https://www.ebay.com',
            searchSupported: true,
        },
    ];

    return res.status(200).json(
        new ApiResponse(200, { platforms }, 'Platforms with search support')
    );
});

export {
    findSimilarProducts,
    getSupportedPlatformsForSearch,
};
