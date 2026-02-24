import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ScraperService from '../services/scraper.service.js';
import ScraperFactory from '../utils/scrapers/ScraperFactory.js';

/**
 * Controller for scraping operations
 */

/**
 * @route POST /api/v1/scraper/scrape
 * @desc Scrape a product from URL and save it
 */
const scrapeProduct = asyncHandler(async (req, res) => {
    const { url } = req.body;
    const userId = req.user?.id;

    if (!url) {
        throw new ApiError(400, 'Product URL is required');
    }

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        throw new ApiError(400, 'Invalid URL format');
    }

    // Check if platform is supported
    const platform = ScraperFactory.detectPlatform(url);
    if (platform === 'Unknown') {
        throw new ApiError(400, `Unsupported platform. Supported platforms: ${ScraperFactory.getSupportedPlatforms().join(', ')}`);
    }

    const product = await ScraperService.scrapeAndSaveProduct(url, userId);

    return res.status(201).json(
        new ApiResponse(201, product, 'Product scraped and saved successfully')
    );
});

/**
 * @route POST /api/v1/scraper/update/:productId
 * @desc Update product price by re-scraping
 */
const updateProductPrice = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const product = await ScraperService.updateProductPrice(productId);

    return res.status(200).json(
        new ApiResponse(200, product, 'Product price updated successfully')
    );
});

/**
 * @route POST /api/v1/scraper/bulk-update
 * @desc Bulk update products (admin/scheduled task)
 */
const bulkUpdateProducts = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.body;

    const results = await ScraperService.bulkUpdateProducts(limit);

    return res.status(200).json(
        new ApiResponse(200, results, 'Bulk update completed')
    );
});

/**
 * @route GET /api/v1/scraper/supported-platforms
 * @desc Get list of supported platforms
 */
const getSupportedPlatforms = asyncHandler(async (req, res) => {
    const platforms = ScraperFactory.getSupportedPlatforms();

    return res.status(200).json(
        new ApiResponse(200, { platforms }, 'Supported platforms retrieved')
    );
});

/**
 * @route POST /api/v1/scraper/scrape-multi-platform
 * @desc Scrape same product from multiple platforms (without saving)
 */
const scrapeMultiPlatform = asyncHandler(async (req, res) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new ApiError(400, 'URLs array is required');
    }

    // Validate all URLs
    const validatedUrls = [];
    for (const url of urls) {
        try {
            new URL(url);
            const platform = ScraperFactory.detectPlatform(url);
            if (platform !== 'Unknown') {
                validatedUrls.push(url);
            }
        } catch (error) {
            // Skip invalid URLs
        }
    }

    if (validatedUrls.length === 0) {
        throw new ApiError(400, 'No valid platform URLs provided');
    }

    const products = await ScraperService.scrapeMultiplePlatforms(validatedUrls);

    return res.status(200).json(
        new ApiResponse(200, products, 'Products scraped from multiple platforms')
    );
});

/**
 * @route POST /api/v1/scraper/search-cross-platform
 * @desc Search and scrape similar products on other platforms
 */
const searchCrossPlatform = asyncHandler(async (req, res) => {
    const { url, platforms } = req.body;

    if (!url) {
        throw new ApiError(400, 'Product URL is required');
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        throw new ApiError(400, 'Invalid URL format');
    }

    // Check if platform is supported
    const platform = ScraperFactory.detectPlatform(url);
    if (platform === 'Unknown') {
        throw new ApiError(400, `Unsupported platform. Supported platforms: ${ScraperFactory.getSupportedPlatforms().join(', ')}`);
    }

    try {
        const result = await ScraperService.searchCrossPlatform(url, platforms);

        return res.status(200).json(
            new ApiResponse(200, result, 'Cross-platform search completed successfully')
        );
    } catch (error) {
        console.error('Cross-platform search error:', error);
        throw new ApiError(500, `Failed to search across platforms: ${error.message}`);
    }
});

export {
    scrapeProduct,
    updateProductPrice,
    bulkUpdateProducts,
    getSupportedPlatforms,
    scrapeMultiPlatform,
    searchCrossPlatform
};
