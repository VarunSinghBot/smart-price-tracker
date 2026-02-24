import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ScraperService from '../services/scraper.service.js';
import ScraperFactory from '../utils/scrapers/ScraperFactory.js';

/**
 * @route POST /api/v1/scraper/scrape-and-search
 * @desc Scrape a product and search for similar products on other platforms
 */
const scrapeAndSearchSimilar = asyncHandler(async (req, res) => {
    const { url } = req.body;

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
        throw new ApiError(400, `Unsupported platform`);
    }

    // Scrape the main product
    const mainProduct = await ScraperService.scrapeProductData(url);
    
    // Extract product title for searching
    const productTitle = mainProduct.title;
    
    // For now, we'll return just the main product
    // In future, we can add search functionality for other platforms
    // by constructing search URLs for Amazon, Flipkart, eBay, etc.
    
    const results = {
        mainProduct,
        similarProducts: [], // Placeholder for future implementation
        searchQuery: productTitle
    };

    return res.status(200).json(
        new ApiResponse(200, results, 'Product scraped successfully')
    );
});

export { scrapeAndSearchSimilar };
