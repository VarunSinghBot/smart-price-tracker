import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('FlipkartScraper');

/**
 * Flipkart-specific scraper implementation
 */
class FlipkartScraper extends BaseScraper {
    constructor() {
        super();
        this.platform = 'Flipkart';
    }

    /**
     * Scrape product data from Flipkart URL
     * @param {string} url - Flipkart product URL
     * @returns {Promise<Object>} - Scraped product data
     */
    async scrapeProduct(url) {
        try {
            await this.init();
            await this.goto(url);

            // Wait for product page to load
            const productLoaded = await this.waitForSelector('.B_NuCI', 10000);
            if (!productLoaded) {
                throw new Error('Product page did not load properly');
            }

            // Extract product data
            const productData = {
                url,
                platform: this.platform,
                title: await this.getTitle(),
                currentPrice: await this.getPrice(),
                currency: 'INR',
                imageUrl: await this.getImageUrl(),
                inStock: await this.getStockStatus(),
                productId: this.extractProductId(url),
                metadata: await this.getMetadata()
            };

            logger.info('Successfully scraped Flipkart product', { title: productData.title });
            return productData;

        } catch (error) {
            logger.error('Failed to scrape Flipkart product', { url, error: error.message });
            throw error;
        } finally {
            await this.close();
        }
    }

    /**
     * Extract product title
     */
    async getTitle() {
        const titleSelectors = [
            '.B_NuCI',
            'h1.yhB1nd',
            'span.B_NuCI'
        ];

        for (const selector of titleSelectors) {
            const title = await this.getTextContent(selector);
            if (title) return title;
        }

        return 'Unknown Product';
    }

    /**
     * Extract product price
     */
    async getPrice() {
        const priceSelectors = [
            '._30jeq3._16Jk6d',
            'div._30jeq3._16Jk6d',
            '._30jeq3',
            '.\_25b18c span'
        ];

        for (const selector of priceSelectors) {
            const priceText = await this.getTextContent(selector);
            if (priceText) {
                const price = this.extractPrice(priceText);
                if (price) return price;
            }
        }

        logger.warn('Price not found on Flipkart product page');
        return null;
    }

    /**
     * Extract product image URL
     */
    async getImageUrl() {
        const imageSelectors = [
            '._396cs4._2amPTt._3qGmMb img',
            '._1Nyybr._30XEf0 img',
            'img._396cs4'
        ];

        for (const selector of imageSelectors) {
            const imageUrl = await this.getAttribute(selector, 'src');
            if (imageUrl) return imageUrl;
        }

        return null;
    }

    /**
     * Check stock status
     */
    async getStockStatus() {
        // Check for "OUT OF STOCK" or similar messages
        const stockSelectors = [
            '._16FRp0',
            '.availabilityStatus',
            '._3xFhiH'
        ];

        for (const selector of stockSelectors) {
            const stockText = await this.getTextContent(selector);
            if (stockText) {
                return this.checkInStock(stockText);
            }
        }

        // If "Add to Cart" button exists, product is in stock
        const addToCartExists = await this.waitForSelector('._2KpZ6l._2U9uOA._3v1-ww', 3000);
        return addToCartExists;
    }

    /**
     * Extract product ID from URL
     */
    extractProductId(url) {
        const pidMatch = url.match(/pid=([A-Z0-9]+)/i);
        if (pidMatch) return pidMatch[1];

        const pathMatch = url.match(/\/p\/itm([a-z0-9]+)/i);
        return pathMatch ? pathMatch[1] : null;
    }

    /**
     * Scrape search results from Flipkart
     * @param {string} searchUrl - Flipkart search URL
     * @param {number} limit - Maximum number of results to return
     * @returns {Promise<Array>} - Array of product data
     */
    async scrapeSearchResults(searchUrl, limit = 5) {
        try {
            await this.init();
            await this.goto(searchUrl);

            // Wait for search results
            const resultsLoaded = await this.waitForSelector('._1AtVbE', 5000);
            if (!resultsLoaded) {
                logger.warn('No search results found on Flipkart');
                return [];
            }

            // Small delay for dynamic content
            await this.page.waitForTimeout(2000);

            // Extract product data from search results
            const products = await this.page.evaluate((maxResults) => {
                const results = [];
                const items = document.querySelectorAll('._1AtVbE, ._2kHMtA, .s1Q9rs');
                
                for (let i = 0; i < Math.min(items.length, maxResults); i++) {
                    const item = items[i];
                    
                    // Extract title and URL
                    const titleEl = item.querySelector('.IRpwTa, ._4rR01T, .s1Q9rs');
                    const linkEl = item.querySelector('a');
                    const title = titleEl?.innerText?.trim();
                    const relativeUrl = linkEl?.getAttribute('href');
                    const url = relativeUrl ? `https://www.flipkart.com${relativeUrl}` : null;
                    
                    // Extract price
                    const priceEl = item.querySelector('._30jeq3, ._25b18c .Nx9bqj');
                    const priceText = priceEl?.innerText;
                    
                    // Extract image
                    const imageEl = item.querySelector('._396cs4, .CXW8mj');
                    const imageUrl = imageEl?.getAttribute('src');
                    
                    if (title && url) {
                        results.push({
                            title,
                            url,
                            priceText,
                            imageUrl
                        });
                    }
                }
                
                return results;
            }, limit);

            // Process prices
            const processedProducts = products.map(p => ({
                ...p,
                platform: this.platform,
                currentPrice: p.priceText ? this.extractPrice(p.priceText) : null,
                currency: 'INR',
                inStock: true,
                productId: null,
                metadata: {}
            }));

            logger.info(`Scraped ${processedProducts.length} products from Flipkart search`);
            return processedProducts;

        } catch (error) {
            logger.error('Failed to scrape Flipkart search results', { error: error.message });
            return [];
        } finally {
            await this.close();
        }
    }

    /**
     * Extract additional metadata
     */
    async getMetadata() {
        const metadata = {};

        // Try to get rating
        const rating = await this.getTextContent('._3LWZlK');
        if (rating) {
            const ratingMatch = rating.match(/[\d.]+/);
            if (ratingMatch) {
                metadata.rating = parseFloat(ratingMatch[0]);
            }
        }

        // Try to get review count
        const reviewCount = await this.getTextContent('._2_R_DZ span span');
        if (reviewCount) {
            const countMatch = reviewCount.match(/([\d,]+)/);
            if (countMatch) {
                metadata.reviewCount = parseInt(countMatch[1].replace(/,/g, ''));
            }
        }

        return metadata;
    }
}

export default FlipkartScraper;
