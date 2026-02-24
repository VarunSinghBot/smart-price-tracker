import AmazonScraper from './AmazonScraper.js';
import FlipkartScraper from './FlipkartScraper.js';
import EbayScraper from './EbayScraper.js';
import Logger from '../logger.js';

const logger = new Logger('ScraperFactory');

/**
 * Factory class to get the appropriate scraper based on URL
 */
class ScraperFactory {
    /**
     * Detect platform from URL
     * @param {string} url - Product URL
     * @returns {string} - Platform name
     */
    static detectPlatform(url) {
        const urlLower = url.toLowerCase();

        if (urlLower.includes('amazon.')) {
            return 'Amazon';
        } else if (urlLower.includes('flipkart.')) {
            return 'Flipkart';
        } else if (urlLower.includes('ebay.')) {
            return 'eBay';
        }

        return 'Unknown';
    }

    /**
     * Get the appropriate scraper for a given URL
     * @param {string} url - Product URL
     * @returns {BaseScraper} - Platform-specific scraper instance
     */
    static getScraper(url) {
        const platform = this.detectPlatform(url);

        logger.info(`Detected platform: ${platform}`, { url });

        switch (platform) {
            case 'Amazon':
                return new AmazonScraper();
            case 'Flipkart':
                return new FlipkartScraper();
            case 'eBay':
                return new EbayScraper();
            default:
                throw new Error(`Unsupported platform: ${platform}. URL: ${url}`);
        }
    }

    /**
     * Scrape product from any supported platform
     * @param {string} url - Product URL
     * @returns {Promise<Object>} - Scraped product data
     */
    static async scrapeProduct(url) {
        const scraper = this.getScraper(url);
        return await scraper.scrapeProduct(url);
    }

    /**
     * Scrape search results from any supported platform
     * @param {string} searchUrl - Search URL
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of product data
     */
    static async scrapeSearchResults(searchUrl, limit = 5) {
        const scraper = this.getScraper(searchUrl);
        return await scraper.scrapeSearchResults(searchUrl, limit);
    }

    /**
     * Get list of supported platforms
     * @returns {Array<string>} - List of supported platforms
     */
    static getSupportedPlatforms() {
        return ['Amazon', 'Flipkart', 'eBay'];
    }
}

export default ScraperFactory;
