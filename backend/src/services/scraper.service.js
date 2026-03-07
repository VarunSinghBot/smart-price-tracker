import ScraperFactory from '../utils/scrapers/ScraperFactory.js';
import AmazonSearchScraper from '../utils/scrapers/AmazonSearchScraper.js';
import FlipkartSearchScraper from '../utils/scrapers/FlipkartSearchScraper.js';
import EbaySearchScraper from '../utils/scrapers/EbaySearchScraper.js';
import pLimit from 'p-limit';
import prisma from '../utils/prisma.js';
import Logger from '../utils/logger.js';

const logger = new Logger('ScraperService');

/**
 * Service for handling web scraping operations
 */
class ScraperService {
    /**
     * Scrape product data without saving to database
     * @param {string} url - Product URL
     * @returns {Promise<Object>} - Scraped product data
     */
    static async scrapeProductData(url) {
        try {
            logger.info('Scraping product data (without saving)', { url });
            const scrapedData = await ScraperFactory.scrapeProduct(url);
            logger.info('Product data scraped successfully');
            return scrapedData;
        } catch (error) {
            logger.error('Failed to scrape product data', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Clean and extract searchable product title
     * @param {string} title - Product title
     * @returns {string} - Cleaned search query
     */
    static cleanProductTitle(title) {
        // Remove common unnecessary words and special characters
        let cleaned = title
            .toLowerCase()
            .replace(/\([^)]*\)/g, '') // Remove parentheses and content
            .replace(/\[[^\]]*\]/g, '') // Remove brackets and content
            .replace(/[,|]/g, ' ') // Replace commas and pipes with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();

        // Take first 5-7 significant words
        const words = cleaned.split(' ').filter(w => w.length > 2);
        return words.slice(0, 7).join(' ');
    }

    /**
     * Build search URL for a specific platform
     * @param {string} platform - Platform name (Amazon, Flipkart, eBay)
     * @param {string} searchQuery - Search query
     * @returns {string} - Search URL
     */
    static buildSearchUrl(platform, searchQuery) {
        const encodedQuery = encodeURIComponent(searchQuery);
        
        switch (platform.toLowerCase()) {
            case 'amazon':
                return `https://www.amazon.in/s?k=${encodedQuery}`;
            case 'flipkart':
                return `https://www.flipkart.com/search?q=${encodedQuery}`;
            case 'ebay':
                return `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`;
            default:
                throw new Error(`Unsupported platform for search: ${platform}`);
        }
    }

    /**
     * Get search scraper for platform
     * @param {string} platform - Platform name
     * @returns {Object} - Search scraper instance
     */
    static getSearchScraper(platform) {
        switch (platform.toLowerCase()) {
            case 'amazon':
                return new AmazonSearchScraper();
            case 'flipkart':
                return new FlipkartSearchScraper();
            case 'ebay':
                return new EbaySearchScraper();
            default:
                throw new Error(`No search scraper for platform: ${platform}`);
        }
    }

    /**
     * Search and scrape products across multiple platforms
     * @param {string} url - Original product URL
     * @param {Array<string>} platformsToSearch - Platforms to search on (optional)
     * @param {number} limit - Maximum results per platform (default: 3)
     * @returns {Promise<Object>} - Main product and similar products from other platforms
     */
    static async searchCrossPlatform(url, platformsToSearch = null, limit = 3) {
        try {
            logger.info('Starting cross-platform search', { url });

            // Step 1: Scrape the main product
            const mainProduct = await this.scrapeProductData(url);
            const mainPlatform = ScraperFactory.detectPlatform(url);

            // Step 2: Extract and clean search query
            const searchQuery = this.cleanProductTitle(mainProduct.title);
            logger.info('Search query extracted', { searchQuery });

            // Step 3: Determine which platforms to search
            const allPlatforms = ScraperFactory.getSupportedPlatforms();
            const platformsToQuery = platformsToSearch || allPlatforms.filter(p => p.toLowerCase() !== mainPlatform.toLowerCase());

            // Step 4: Scrape search results from other platforms with concurrency limit
            const concurrencyLimit = pLimit(3); // Max 3 concurrent platform searches
            
            const searchPromises = platformsToQuery.map(platform =>
                concurrencyLimit(async () => {
                try {
                    logger.info(`Searching on ${platform}`, { searchQuery });

                    // Use the new search scrapers
                    const searchScraper = this.getSearchScraper(platform);
                    const products = await searchScraper.searchProducts(searchQuery, limit);
                    
                    const searchUrl = this.buildSearchUrl(platform, searchQuery);
                    
                    return {
                        success: true,
                        platform,
                        products,
                        searchUrl,
                        totalFound: products.length
                    };
                } catch (error) {
                    logger.error(`Failed to search ${platform}`, { error: error.message });
                    
                    // Still return search URL as fallback
                    const searchUrl = this.buildSearchUrl(platform, searchQuery);
                    return {
                        success: false,
                        platform,
                        products: [],
                        searchUrl,
                        error: error.message
                    };
                }
                })
            );

            // Wait for all searches to complete (with graceful error handling)
            const searchResults = await Promise.allSettled(searchPromises);
            const platformResults = searchResults.map(result => 
                result.status === 'fulfilled' ? result.value : {
                    success: false,
                    platform: 'Unknown',
                    products: [],
                    error: result.reason?.message || 'Unknown error'
                }
            );

            // Collect all similar products from all platforms
            const similarProducts = platformResults
                .filter(r => r.success && r.products.length > 0)
                .flatMap(r => r.products);

            const successfulSearches = platformResults.filter(r => r.success);
            const totalProductsFound = similarProducts.length;

            logger.info('Cross-platform search completed', {
                mainPlatform,
                searchedPlatforms: successfulSearches.length,
                totalProductsFound
            });

            return {
                mainProduct,
                searchQuery,
                platformResults,
                similarProducts,
                totalProductsFound,
                searchedPlatforms: platformsToQuery,
                successfulSearches: successfulSearches.length
            };

        } catch (error) {
            logger.error('Cross-platform search failed', { error: error.message, stack: error.stack });
            throw error;
        }
    }

    /**
     * Scrape and save product data
     * @param {string} url - Product URL
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Saved product data
     */
    static async scrapeAndSaveProduct(url, userId) {
        try {
            logger.info('Starting product scrape', { url, userId });

            // Check if product already exists for this user
            const existingProduct = await prisma.product.findFirst({
                where: {
                    url,
                    userId
                }
            });

            if (existingProduct) {
                logger.info('Product already tracked by user', { productId: existingProduct.id });
                // Update existing product price
                return await this.updateProductPrice(existingProduct.id);
            }

            // Scrape product data
            const scrapedData = await ScraperFactory.scrapeProduct(url);

            // Save product to database
            const product = await prisma.product.create({
                data: {
                    url: scrapedData.url,
                    title: scrapedData.title,
                    platform: scrapedData.platform,
                    currentPrice: scrapedData.currentPrice,
                    currency: scrapedData.currency,
                    imageUrl: scrapedData.imageUrl,
                    inStock: scrapedData.inStock,
                    productId: scrapedData.productId,
                    metadata: scrapedData.metadata,
                    userId,
                    lastChecked: new Date()
                }
            });

            // Save initial price history
            if (scrapedData.currentPrice) {
                await prisma.priceHistory.create({
                    data: {
                        price: scrapedData.currentPrice,
                        inStock: scrapedData.inStock,
                        productId: product.id
                    }
                });
            }

            logger.info('Product scraped and saved successfully', { productId: product.id });
            return product;

        } catch (error) {
            logger.error('Failed to scrape and save product', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Update product price by scraping
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} - Updated product data
     */
    static async updateProductPrice(productId) {
        try {
            logger.info('Updating product price', { productId });

            // Get product from database
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Scrape latest data
            const scrapedData = await ScraperFactory.scrapeProduct(product.url);

            // Check if price changed
            const priceChanged = product.currentPrice !== scrapedData.currentPrice;

            // Update product
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                    currentPrice: scrapedData.currentPrice,
                    inStock: scrapedData.inStock,
                    imageUrl: scrapedData.imageUrl || product.imageUrl,
                    metadata: scrapedData.metadata,
                    lastChecked: new Date()
                }
            });

            // Save price history if price changed
            if (priceChanged && scrapedData.currentPrice) {
                await prisma.priceHistory.create({
                    data: {
                        price: scrapedData.currentPrice,
                        inStock: scrapedData.inStock,
                        productId: product.id
                    }
                });

                logger.info('Price changed', {
                    productId,
                    oldPrice: product.currentPrice,
                    newPrice: scrapedData.currentPrice
                });

                // Check and trigger alerts if price dropped
                await this.checkAndTriggerAlerts(product.id, scrapedData.currentPrice);
            }

            logger.info('Product price updated successfully', { productId });
            return updatedProduct;

        } catch (error) {
            logger.error('Failed to update product price', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Check and trigger alerts for a product
     * @param {string} productId - Product ID
     * @param {number} currentPrice - Current price
     */
    static async checkAndTriggerAlerts(productId, currentPrice) {
        try {
            // Find active alerts for this product where target price is met
            const alerts = await prisma.alert.findMany({
                where: {
                    productId,
                    active: true,
                    notified: false,
                    targetPrice: {
                        gte: currentPrice
                    }
                },
                include: {
                    user: true,
                    product: true
                }
            });

            for (const alert of alerts) {
                // Mark alert as notified
                await prisma.alert.update({
                    where: { id: alert.id },
                    data: {
                        notified: true,
                        notifiedAt: new Date()
                    }
                });

                logger.info('Alert triggered', {
                    alertId: alert.id,
                    userId: alert.userId,
                    productId,
                    targetPrice: alert.targetPrice,
                    currentPrice
                });

                // TODO: Send notification (email, push notification, etc.)
                // await NotificationService.sendPriceAlert(alert);
            }

        } catch (error) {
            logger.error('Failed to check alerts', { productId, error: error.message });
        }
    }

    /**
     * Bulk update products (for scheduled tasks)
     * @param {number} limit - Maximum products to update
     * @returns {Promise<Object>} - Update results
     */
    static async bulkUpdateProducts(limit = 50) {
        try {
            logger.info('Starting bulk product update', { limit });

            // Get products that haven't been checked recently (older than 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const products = await prisma.product.findMany({
                where: {
                    lastChecked: {
                        lt: oneHourAgo
                    }
                },
                take: limit,
                orderBy: {
                    lastChecked: 'asc'
                }
            });

            const results = {
                total: products.length,
                successful: 0,
                failed: 0,
                errors: []
            };

            for (const product of products) {
                try {
                    await this.updateProductPrice(product.id);
                    results.successful++;
                    
                    // Small delay to avoid overwhelming servers
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        productId: product.id,
                        error: error.message
                    });
                    logger.error('Failed to update product in bulk', {
                        productId: product.id,
                        error: error.message
                    });
                }
            }

            logger.info('Bulk update completed', results);
            return results;

        } catch (error) {
            logger.error('Bulk update failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Scrape product from multiple platforms
     * @param {Array<string>} urls - Array of product URLs from different platforms
     * @returns {Promise<Array>} - Array of scraped products with platform info
     */
    static async scrapeMultiplePlatforms(urls) {
        try {
            logger.info('Starting multi-platform scrape', { urlCount: urls.length });

            const scrapePromises = urls.map(async (url) => {
                try {
                    const scrapedData = await ScraperFactory.scrapeProduct(url);
                    return {
                        success: true,
                        platform: scrapedData.platform,
                        data: scrapedData
                    };
                } catch (error) {
                    logger.error('Failed to scrape from platform', { url, error: error.message });
                    return {
                        success: false,
                        platform: ScraperFactory.detectPlatform(url),
                        error: error.message,
                        url
                    };
                }
            });

            const results = await Promise.all(scrapePromises);
            
            const successfulResults = results.filter(r => r.success).map(r => r.data);
            const failedResults = results.filter(r => !r.success);

            logger.info('Multi-platform scrape completed', {
                total: results.length,
                successful: successfulResults.length,
                failed: failedResults.length
            });

            return {
                products: successfulResults,
                failed: failedResults,
                totalScraped: successfulResults.length
            };

        } catch (error) {
            logger.error('Multi-platform scrape failed', { error: error.message });
            throw error;
        }
    }
}

export default ScraperService;
