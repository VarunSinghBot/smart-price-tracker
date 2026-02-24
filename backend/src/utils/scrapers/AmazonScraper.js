import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('AmazonScraper');

/**
 * Amazon-specific scraper implementation
 */
class AmazonScraper extends BaseScraper {
    constructor() {
        super();
        this.platform = 'Amazon';
    }

    /**
     * Scrape product data from Amazon URL
     * @param {string} url - Amazon product URL
     * @returns {Promise<Object>} - Scraped product data
     */
    async scrapeProduct(url) {
        try {
            await this.init();
            await this.goto(url);

            // Wait for product page to load
            const productLoaded = await this.waitForSelector('#productTitle', 10000);
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
                productId: this.extractAsin(url),
                metadata: await this.getMetadata()
            };

            logger.info('Successfully scraped Amazon product', { title: productData.title });
            return productData;

        } catch (error) {
            logger.error('Failed to scrape Amazon product', { url, error: error.message });
            throw error;
        } finally {
            await this.close();
        }
    }

    /**
     * Extract product title
     */
    async getTitle() {
        const title = await this.getTextContent('#productTitle');
        return title || 'Unknown Product';
    }

    /**
     * Extract product price
     */
    async getPrice() {
        // Try multiple price selectors (Amazon has various formats)
        const priceSelectors = [
            '.a-price .a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.a-price-whole',
            '#price_inside_buybox'
        ];

        for (const selector of priceSelectors) {
            const priceText = await this.getTextContent(selector);
            if (priceText) {
                const price = this.extractPrice(priceText);
                if (price) return price;
            }
        }

        logger.warn('Price not found on Amazon product page');
        return null;
    }

    /**
     * Extract product image URL
     */
    async getImageUrl() {
        const imageSelectors = [
            '#landingImage',
            '#imgBlkFront',
            '#ebooksImgBlkFront'
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
        const availabilitySelectors = [
            '#availability span',
            '#availability',
            '.a-color-success',
            '.a-color-price'
        ];

        for (const selector of availabilitySelectors) {
            const availabilityText = await this.getTextContent(selector);
            if (availabilityText) {
                return this.checkInStock(availabilityText);
            }
        }

        return true; // Default to in stock if not specified
    }

    /**
     * Extract ASIN from URL
     */
    extractAsin(url) {
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
        return asinMatch ? asinMatch[1] : null;
    }

    /**
     * Extract additional metadata
     */
    async getMetadata() {
        const metadata = {};

        // Try to get brand
        const brand = await this.getTextContent('#bylineInfo');
        if (brand) {
            metadata.brand = brand.replace(/^Visit the |^Brand: /i, '').trim();
        }

        // Try to get rating
        const rating = await this.getTextContent('.a-icon-alt');
        if (rating) {
            const ratingMatch = rating.match(/[\d.]+/);
            if (ratingMatch) {
                metadata.rating = parseFloat(ratingMatch[0]);
            }
        }

        // Try to get review count
        const reviewCount = await this.getTextContent('#acrCustomerReviewText');
        if (reviewCount) {
            const countMatch = reviewCount.match(/([\d,]+)/);
            if (countMatch) {
                metadata.reviewCount = parseInt(countMatch[1].replace(/,/g, ''));
            }
        }

        return metadata;
    }

    /**
     * Scrape search results from Amazon
     * @param {string} searchUrl - Amazon search URL
     * @param {number} limit - Maximum number of results to return
     * @returns {Promise<Array>} - Array of product data
     */
    async scrapeSearchResults(searchUrl, limit = 5) {
        try {
            await this.init();
            await this.goto(searchUrl);

            // Wait for search results
            const resultsLoaded = await this.waitForSelector('[data-component-type="s-search-result"]', 10000);
            if (!resultsLoaded) {
                logger.warn('No search results found on Amazon');
                return [];
            }

            // Extract product data from search results
            const products = await this.page.evaluate((maxResults) => {
                const results = [];
                const items = document.querySelectorAll('[data-component-type="s-search-result"]');
                
                for (let i = 0; i < Math.min(items.length, maxResults); i++) {
                    const item = items[i];
                    
                    // Extract title and URL
                    const titleEl = item.querySelector('h2 a');
                    const title = titleEl?.innerText?.trim();
                    const relativeUrl = titleEl?.getAttribute('href');
                    const url = relativeUrl ? `https://www.amazon.in${relativeUrl}` : null;
                    
                    // Extract price
                    const priceEl = item.querySelector('.a-price .a-offscreen');
                    const priceText = priceEl?.innerText;
                    
                    // Extract image
                    const imageEl = item.querySelector('img.s-image');
                    const imageUrl = imageEl?.getAttribute('src');
                    
                    // Extract ASIN
                    const asin = item.getAttribute('data-asin');
                    
                    if (title && url) {
                        results.push({
                            title,
                            url,
                            priceText,
                            imageUrl,
                            productId: asin
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
                currency: 'USD',
                inStock: true,
                metadata: {}
            }));

            logger.info(`Scraped ${processedProducts.length} products from Amazon search`);
            return processedProducts;

        } catch (error) {
            logger.error('Failed to scrape Amazon search results', { error: error.message });
            return [];
        } finally {
            await this.close();
        }
    }
}

export default AmazonScraper;
