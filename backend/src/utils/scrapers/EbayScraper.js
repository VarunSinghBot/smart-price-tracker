import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('EbayScraper');

/**
 * eBay-specific scraper implementation
 */
class EbayScraper extends BaseScraper {
    constructor() {
        super();
        this.platform = 'eBay';
    }

    /**
     * Scrape product data from eBay URL
     * @param {string} url - eBay product URL
     * @returns {Promise<Object>} - Scraped product data
     */
    async scrapeProduct(url) {
        try {
            await this.init();
            await this.goto(url);

            // Wait for product page to load
            const productLoaded = await this.waitForSelector('.x-item-title__mainTitle', 10000);
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
                productId: this.extractItemId(url),
                metadata: await this.getMetadata()
            };

            logger.info('Successfully scraped eBay product', { title: productData.title });
            return productData;

        } catch (error) {
            logger.error('Failed to scrape eBay product', { url, error: error.message });
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
            '.x-item-title__mainTitle',
            'h1.x-item-title__mainTitle',
            '#itemTitle'
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
            '.x-price-primary span',
            '.x-price-primary',
            '#prcIsum',
            '.notranslate.vi-VR-cvipPrice'
        ];

        for (const selector of priceSelectors) {
            const priceText = await this.getTextContent(selector);
            if (priceText) {
                const price = this.extractPrice(priceText);
                if (price) return price;
            }
        }

        logger.warn('Price not found on eBay product page');
        return null;
    }

    /**
     * Extract product image URL
     */
    async getImageUrl() {
        const imageSelectors = [
            '.ux-image-carousel-item.active img',
            '.vi-image-gallery__image img',
            '#icImg'
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
        // Check for quantity available
        const quantitySelectors = [
            '.x-quantity__availability',
            '#qtySubTxt',
            '.ux-action'
        ];

        for (const selector of quantitySelectors) {
            const quantityText = await this.getTextContent(selector);
            if (quantityText) {
                return this.checkInStock(quantityText);
            }
        }

        // If "Add to cart" or "Buy It Now" button exists, product is in stock
        const buyButtonExists = await this.waitForSelector('.ux-call-to-action', 3000);
        return buyButtonExists;
    }

    /**
     * Extract item ID from URL
     */
    extractItemId(url) {
        const itemIdMatch = url.match(/\/itm\/([0-9]+)/i);
        return itemIdMatch ? itemIdMatch[1] : null;
    }

    /**
     * Extract additional metadata
     */
    async getMetadata() {
        const metadata = {};

        // Try to get seller info
        const seller = await this.getTextContent('.x-sellercard-atf__info__about-seller a');
        if (seller) {
            metadata.seller = seller.trim();
        }

        // Try to get condition
        const condition = await this.getTextContent('.x-item-condition-text span');
        if (condition) {
            metadata.condition = condition.trim();
        }

        return metadata;
    }

    /**
     * Scrape search results from eBay
     * @param {string} searchUrl - eBay search URL
     * @param {number} limit - Maximum number of results to return
     * @returns {Promise<Array>} - Array of product data
     */
    async scrapeSearchResults(searchUrl, limit = 5) {
        try {
            await this.init();
            await this.goto(searchUrl);

            // Wait for search results
            const resultsLoaded = await this.waitForSelector('.s-item', 5000);
            if (!resultsLoaded) {
                logger.warn('No search results found on eBay');
                return [];
            }

            // Extract product data from search results
            const products = await this.page.evaluate((maxResults) => {
                const results = [];
                const items = document.querySelectorAll('.s-item');
                
                for (let i = 0; i < Math.min(items.length, maxResults); i++) {
                    const item = items[i];
                    
                    // Skip sponsored/ad items
                    if (item.classList.contains('s-item--ad')) continue;
                    
                    // Extract title and URL
                    const titleEl = item.querySelector('.s-item__title');
                    const linkEl = item.querySelector('.s-item__link');
                    const title = titleEl?.innerText?.trim();
                    const url = linkEl?.getAttribute('href');
                    
                    // Extract price
                    const priceEl = item.querySelector('.s-item__price');
                    const priceText = priceEl?.innerText;
                    
                    // Extract image
                    const imageEl = item.querySelector('.s-item__image-img');
                    const imageUrl = imageEl?.getAttribute('src');
                    
                    if (title && url && title !== 'Shop on eBay') {
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
                currency: 'USD',
                inStock: true,
                productId: null,
                metadata: {}
            }));

            logger.info(`Scraped ${processedProducts.length} products from eBay search`);
            return processedProducts;

        } catch (error) {
            logger.error('Failed to scrape eBay search results', { error: error.message });
            return [];
        } finally {
            await this.close();
        }
    }
}

export default EbayScraper;
