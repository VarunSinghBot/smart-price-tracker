import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('FlipkartSearchScraper');

/**
 * Flipkart Search Results Scraper
 * Scrapes product listings from Flipkart search pages
 */
class FlipkartSearchScraper extends BaseScraper {
    constructor() {
        super();
        this.baseUrl = 'https://www.flipkart.com';
    }

    /**
     * Build search URL for Flipkart
     * @param {string} searchQuery - Search query
     * @returns {string} - Search URL
     */
    buildSearchUrl(searchQuery) {
        const encoded = encodeURIComponent(searchQuery);
        return `${this.baseUrl}/search?q=${encoded}`;
    }

    /**
     * Scrape search results from Flipkart
     * @param {string} searchQuery - Product search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of product objects
     */
    async searchProducts(searchQuery, limit = 5) {
        try {
            await this.init();
            const searchUrl = this.buildSearchUrl(searchQuery);
            
            logger.info('Searching Flipkart', { searchQuery, searchUrl });
            await this.goto(searchUrl);
            
            // Wait for search results
            await this.waitForSelector('[data-id], ._1AtVbE, ._13oc-S', 5000);
            await this.randomDelay(1000, 2000);

            // Extract product cards using URL-based selector (most stable)
            const products = await this.page.evaluate((maxResults) => {
                // Find all product links (every Flipkart product URL contains /p/)
                const productLinks = Array.from(document.querySelectorAll('a[href*="/p/"]'));
                
                // Get unique products by URL
                const uniqueProducts = new Map();
                
                for (const anchor of productLinks) {
                    const url = anchor.href;
                    if (uniqueProducts.has(url)) continue;
                    
                    // Find the card container
                    let card = anchor.closest('[data-id]') || anchor.closest('div[class*="col"]');
                    if (!card) card = anchor;
                    
                    // Extract title from anchor text or nearby elements
                    let title = anchor.innerText?.trim() || anchor.getAttribute('title');
                    if (!title || title.length < 5) {
                        const titleEl = card.querySelector('[class*="title"], [class*="IRpw"]');
                        title = titleEl?.textContent?.trim();
                    }
                    
                    // Extract image
                    const imgEl = card.querySelector('img');
                    const imageUrl = imgEl?.src || null;
                    
                    // Extract price
                    const priceEl = card.querySelector('[class*="30jeq"], .Nx9bqj, [class*="price"]');
                    let price = null;
                    if (priceEl) {
                        price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
                    }
                    
                    // Extract rating
                    const ratingEl = card.querySelector('[class*="gUuXy"], ._3LWZlK');
                    const rating = ratingEl ? parseFloat(ratingEl.textContent.replace(/[^0-9.]/g, '')) : null;
                    
                    // Extract product ID from URL
                    const productId = url.match(/\/p\/([^\/\?]+)/)?.[1] || null;
                    
                    // Skip if missing critical data
                    if (!title || !url || title.length < 5) continue;
                    
                    uniqueProducts.set(url, {
                        platform: 'Flipkart',
                        productId,
                        title,
                        price,
                        imageUrl,
                        url,
                        rating
                    });
                    
                    if (uniqueProducts.size >= maxResults) break;
                }
                
                return Array.from(uniqueProducts.values());
            }, limit);

            logger.info('Flipkart search complete', { 
                query: searchQuery,
                resultsFound: products.length 
            });

            return products;
        } catch (error) {
            logger.error('Flipkart search failed', { 
                searchQuery, 
                error: error.message 
            });
            return [];
        } finally {
            await this.close();
        }
    }
}

export default FlipkartSearchScraper;
