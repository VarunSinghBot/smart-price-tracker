import { chromium } from 'playwright';
import Logger from '../logger.js';

const logger = new Logger('BaseScraper');

/**
 * Base Scraper class for web scraping using Playwright
 * Provides common functionality for all platform-specific scrapers
 */
class BaseScraper {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.timeout = 30000; // 30 seconds default timeout
    }

    /**
     * Initialize browser instance
     * @param {Object} options - Browser launch options
     */
    async init(options = {}) {
        try {
            logger.info('Initializing browser...');
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920x1080'
                ],
                ...options
            });

            this.context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York'
            });

            this.page = await this.context.newPage();
            await this.page.setDefaultTimeout(this.timeout);
            
            logger.info('Browser initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize browser', { error: error.message });
            throw error;
        }
    }

    /**
     * Navigate to URL with retry logic
     * @param {string} url - URL to navigate to
     * @param {number} maxRetries - Maximum retry attempts
     */
    async goto(url, maxRetries = 3) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                logger.info(`Navigating to ${url} (attempt ${i + 1}/${maxRetries})`);
                await this.page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: this.timeout
                });
                
                // Random delay to mimic human behavior
                await this.randomDelay(1000, 3000);
                return;
            } catch (error) {
                lastError = error;
                logger.warn(`Navigation attempt ${i + 1} failed`, { error: error.message });
                
                if (i < maxRetries - 1) {
                    await this.randomDelay(2000, 5000);
                }
            }
        }
        
        throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Random delay to mimic human behavior
     * @param {number} min - Minimum delay in ms
     * @param {number} max - Maximum delay in ms
     */
    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.page.waitForTimeout(delay);
    }

    /**
     * Wait for selector with error handling
     * @param {string} selector - CSS selector to wait for
     * @param {number} timeout - Timeout in ms
     */
    async waitForSelector(selector, timeout = this.timeout) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch (error) {
            logger.warn(`Selector not found: ${selector}`);
            return false;
        }
    }

    /**
     * Extract text content from selector
     * @param {string} selector - CSS selector
     * @returns {Promise<string|null>} - Extracted text or null
     */
    async getTextContent(selector) {
        try {
            const element = await this.page.$(selector);
            if (!element) return null;
            
            const text = await element.textContent();
            return text ? text.trim() : null;
        } catch (error) {
            logger.warn(`Failed to get text content for ${selector}`, { error: error.message });
            return null;
        }
    }

    /**
     * Extract attribute from selector
     * @param {string} selector - CSS selector
     * @param {string} attribute - Attribute name
     * @returns {Promise<string|null>} - Attribute value or null
     */
    async getAttribute(selector, attribute) {
        try {
            const element = await this.page.$(selector);
            if (!element) return null;
            
            return await element.getAttribute(attribute);
        } catch (error) {
            logger.warn(`Failed to get attribute ${attribute} for ${selector}`, { error: error.message });
            return null;
        }
    }

    /**
     * Take screenshot for debugging
     * @param {string} filename - Screenshot filename
     */
    async screenshot(filename = 'screenshot.png') {
        try {
            await this.page.screenshot({ path: filename, fullPage: true });
            logger.info(`Screenshot saved: ${filename}`);
        } catch (error) {
            logger.error('Failed to take screenshot', { error: error.message });
        }
    }

    /**
     * Clean up resources
     */
    async close() {
        try {
            if (this.page) await this.page.close();
            if (this.context) await this.context.close();
            if (this.browser) await this.browser.close();
            
            logger.info('Browser closed successfully');
        } catch (error) {
            logger.error('Failed to close browser', { error: error.message });
        }
    }

    /**
     * Extract price from text (handles various formats)
     * @param {string} text - Text containing price
     * @returns {number|null} - Extracted price as number or null
     */
    extractPrice(text) {
        if (!text) return null;
        
        // Remove currency symbols and extract numeric value
        const priceMatch = text.match(/[\d,]+\.?\d*/);
        if (!priceMatch) return null;
        
        const price = parseFloat(priceMatch[0].replace(/,/g, ''));
        return isNaN(price) ? null : price;
    }

    /**
     * Check if product is in stock
     * @param {string} text - Text to check for stock status
     * @returns {boolean} - True if in stock
     */
    checkInStock(text) {
        if (!text) return false;
        
        const outOfStockKeywords = [
            'out of stock',
            'unavailable',
            'currently unavailable',
            'not available',
            'sold out',
            'temporarily out of stock'
        ];
        
        const lowerText = text.toLowerCase();
        return !outOfStockKeywords.some(keyword => lowerText.includes(keyword));
    }
}

export default BaseScraper;
