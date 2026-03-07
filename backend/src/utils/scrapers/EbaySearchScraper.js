import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('EbaySearchScraper');

/**
 * eBay Search Results Scraper
 * Scrapes product listings from eBay search pages
 */
class EbaySearchScraper extends BaseScraper {
    constructor() {
        super();
        this.baseUrl = 'https://www.ebay.com';
    }

    /**
     * Build search URL for eBay
     * @param {string} searchQuery - Search query
     * @returns {string} - Search URL
     */
    buildSearchUrl(searchQuery) {
        const encoded = encodeURIComponent(searchQuery);
        return `${this.baseUrl}/sch/i.html?_nkw=${encoded}`;
    }

    /**
     * Scrape search results from eBay
     * @param {string} searchQuery - Product search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of product objects
     */
    async searchProducts(searchQuery, limit = 5) {
        try {
            await this.init();
            const searchUrl = this.buildSearchUrl(searchQuery);
            
            logger.info('Searching eBay', { searchQuery, searchUrl });
            await this.goto(searchUrl);
            
            // Wait for search results
            await this.waitForSelector('.s-item', 5000);
            await this.randomDelay(1000, 2000);

            // Extract product cards
            const products = await this.page.evaluate((maxResults) => {
                const productCards = Array.from(
                    document.querySelectorAll('.s-item')
                ).slice(1, maxResults + 1); // Skip first item (ad/header)

                return productCards.map(card => {
                    try {
                        // Extract item ID
                        const itemId = card.getAttribute('data-gr4') || 
                                     card.getAttribute('data-view') || null;
                        
                        // Extract title
                        const titleEl = card.querySelector('.s-item__title');
                        const title = titleEl ? titleEl.textContent.trim() : null;
                        
                        // Extract image
                        const imgEl = card.querySelector('.s-item__image-img');
                        const imageUrl = imgEl ? imgEl.src : null;
                        
                        // Extract price
                        const priceEl = card.querySelector('.s-item__price');
                        let price = null;
                        if (priceEl) {
                            const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
                            price = parseFloat(priceText);
                        }
                        
                        // Extract condition (new/used)
                        const conditionEl = card.querySelector('.SECONDARY_INFO');
                        const condition = conditionEl ? conditionEl.textContent.trim() : null;
                        
                        // Extract URL
                        const linkEl = card.querySelector('.s-item__link');
                        const url = linkEl ? linkEl.getAttribute('href') : null;

                        // Extract shipping info
                        const shippingEl = card.querySelector('.s-item__shipping');
                        const shipping = shippingEl ? shippingEl.textContent.trim() : null;

                        // Skip if missing critical data
                        if (!title || !url || title.includes('Shop on eBay')) return null;

                        return {
                            platform: 'eBay',
                            itemId,
                            title,
                            price,
                            imageUrl,
                            url,
                            condition,
                            shipping,
                        };
                    } catch (err) {
                        console.error('Error extracting product:', err);
                        return null;
                    }
                }).filter(p => p !== null);
            }, limit);

            logger.info('eBay search complete', { 
                query: searchQuery,
                resultsFound: products.length 
            });

            return products;
        } catch (error) {
            logger.error('eBay search failed', { 
                searchQuery, 
                error: error.message 
            });
            return [];
        } finally {
            await this.close();
        }
    }
}

export default EbaySearchScraper;
