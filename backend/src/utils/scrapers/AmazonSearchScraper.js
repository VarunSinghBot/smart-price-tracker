import BaseScraper from './BaseScraper.js';
import Logger from '../logger.js';

const logger = new Logger('AmazonSearchScraper');

/**
 * Amazon Search Results Scraper
 * Scrapes product listings from Amazon search pages
 */
class AmazonSearchScraper extends BaseScraper {
    constructor() {
        super();
        this.baseUrl = 'https://www.amazon.in';
    }

    /**
     * Build search URL for Amazon
     * @param {string} searchQuery - Search query
     * @returns {string} - Search URL
     */
    buildSearchUrl(searchQuery) {
        const encoded = encodeURIComponent(searchQuery);
        return `${this.baseUrl}/s?k=${encoded}`;
    }

    /**
     * Scrape search results from Amazon
     * @param {string} searchQuery - Product search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of product objects
     */
    async searchProducts(searchQuery, limit = 5) {
        try {
            await this.init();
            const searchUrl = this.buildSearchUrl(searchQuery);
            
            logger.info('Searching Amazon', { searchQuery, searchUrl });
            await this.goto(searchUrl);
            
            // Wait for search results to load
            await this.waitForSelector('[data-component-type="s-search-result"]', 5000).catch(() => {
                logger.warn('Primary selector not found, trying alternative');
            });
            
            // Try alternative selectors if primary fails
            const hasResults = await this.page.$('[data-component-type="s-search-result"]');
            if (!hasResults) {
                const altResults = await this.page.$('.s-result-item');
                if (!altResults) {
                    logger.warn('No search results found on page', { searchUrl });
                    
                    // Debug: Log page title and check for captcha
                    const pageTitle = await this.page.title();
                    const hasCaptcha = await this.page.$('form[action="/errors/validateCaptcha"]');
                    logger.warn('Page debug info', { 
                        pageTitle, 
                        hasCaptcha: !!hasCaptcha,
                        url: this.page.url() 
                    });
                    
                    return [];
                }
            }
            
            await this.randomDelay(1000, 2000);

            // Extract product cards
            const products = await this.page.evaluate((maxResults) => {
                // Try multiple selectors for search results
                let productCards = Array.from(
                    document.querySelectorAll('[data-component-type="s-search-result"]')
                );
                
                // Fallback to alternative selector if primary fails
                if (productCards.length === 0) {
                    productCards = Array.from(
                        document.querySelectorAll('.s-result-item[data-asin]:not([data-asin=""])')
                    );
                }
                
                // Take only the requested number of results
                productCards = productCards.slice(0, maxResults);

                return productCards.map(card => {
                    try {
                        // Extract ASIN
                        const asin = card.getAttribute('data-asin');
                        
                        // Extract title - try multiple selectors
                        let title = null;
                        const titleSelectors = [
                            'h2 a span',
                            'h2 a',
                            '.a-link-normal .a-text-normal',
                            '.s-title-instructions-style span'
                        ];
                        for (const selector of titleSelectors) {
                            const titleEl = card.querySelector(selector);
                            if (titleEl) {
                                title = titleEl.textContent.trim();
                                break;
                            }
                        }
                        
                        // Extract image - try multiple selectors
                        let imageUrl = null;
                        const imgSelectors = ['img.s-image', 'img[data-image-latency]', '.s-image'];
                        for (const selector of imgSelectors) {
                            const imgEl = card.querySelector(selector);
                            if (imgEl) {
                                imageUrl = imgEl.src || imgEl.getAttribute('data-old-hires') || imgEl.getAttribute('data-src');
                                if (imageUrl) break;
                            }
                        }
                        
                        // Extract price - try multiple formats
                        let price = null;
                        const priceEl = card.querySelector('.a-price-whole');
                        if (priceEl) {
                            price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
                        } else {
                            // Try alternative price selector
                            const altPriceEl = card.querySelector('.a-price .a-offscreen');
                            if (altPriceEl) {
                                price = parseFloat(altPriceEl.textContent.replace(/[^0-9.]/g, ''));
                            }
                        }
                        
                        // Extract rating
                        const ratingEl = card.querySelector('.a-icon-star-small span, .a-icon-alt');
                        const rating = ratingEl ? 
                            parseFloat(ratingEl.textContent.split(' ')[0]) : null;
                        
                        // Extract URL
                        const linkEl = card.querySelector('h2 a, .a-link-normal[href*="/dp/"]');
                        const relativeUrl = linkEl ? linkEl.getAttribute('href') : null;
                        const url = relativeUrl ? 
                            (relativeUrl.startsWith('http') ? relativeUrl : `https://www.amazon.in${relativeUrl}`) 
                            : null;

                        // Skip if missing critical data
                        if (!title || !url) return null;

                        return {
                            platform: 'Amazon',
                            asin,
                            title,
                            price,
                            imageUrl,
                            url,
                            rating,
                        };
                    } catch (err) {
                        console.error('Error extracting product:', err);
                        return null;
                    }
                }).filter(p => p !== null);
            }, limit);

            logger.info('Amazon search complete', { 
                query: searchQuery,
                resultsFound: products.length,
                extractedProducts: products.map(p => ({ title: p.title, hasImage: !!p.imageUrl }))
            });

            return products;
        } catch (error) {
            logger.error('Amazon search failed', { 
                searchQuery, 
                error: error.message 
            });
            return [];
        } finally {
            await this.close();
        }
    }
}

export default AmazonSearchScraper;
