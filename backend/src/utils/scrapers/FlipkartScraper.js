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
     * Extract structured data from JSON-LD scripts
     * @returns {Promise<Object|null>} - Structured product data
     */
    async extractStructuredData() {
        try {
            const jsonData = await this.page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                
                for (const script of scripts) {
                    try {
                        const parsed = JSON.parse(script.innerText);
                        
                        // Product schema
                        if (parsed['@type'] === 'Product') {
                            return parsed;
                        }
                    } catch (e) {}
                }
                return null;
            });

            return jsonData;
        } catch (err) {
            logger.warn('Failed to extract structured data', { error: err.message });
            return null;
        }
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

            // Wait for h1 to ensure page loaded
            await this.page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
            await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

            // Extract structured data from JSON-LD (most reliable)
            const structured = await this.extractStructuredData();
            logger.info('Structured data extracted', { hasData: !!structured });

            // Use structured data with fallbacks to DOM scraping
            let title = structured?.name || await this.getTitle();
            let currentPrice = structured?.offers?.price
                ? parseFloat(structured.offers.price)
                : await this.getPrice();
            let imageUrl = structured?.image || await this.getImageUrl();
            let inStock = structured?.offers?.availability?.includes('InStock') ?? await this.getStockStatus();

            // Extract product data
            const productData = {
                url,
                platform: this.platform,
                title: title || 'Unknown Product',
                currentPrice,
                currency: 'INR',
                imageUrl,
                inStock,
                productId: this.extractProductId(url),
                metadata: await this.getMetadata()
            };

            logger.info('Successfully scraped Flipkart product', { title: productData.title });
            return productData;

        } catch (error) {
            logger.error('Failed to scrape Flipkart product', { url, error: error.message });
            // Take screenshot on failure for debugging
            try {
                await this.screenshot(`flipkart-error-${Date.now()}.png`);
            } catch (e) {}
            throw error;
        } finally {
            await this.close();
        }
    }

    /**
     * Extract product title
     */
    async getTitle() {
        // Try semantic h1 tag first (most stable)
        const h1Title = await this.getTextContent('h1');
        if (h1Title) {
            logger.info('Title extracted from h1');
            return h1Title;
        }

        // Fallback to class-based selectors
        const titleSelectors = [
            'span.VU-ZEz',
            'span.B_NuCI',
            '[data-tkid*="title"]',
            '[class*="title"]'
        ];

        for (const selector of titleSelectors) {
            const title = await this.getTextContent(selector);
            if (title) {
                logger.info('Title extracted', { selector });
                return title;
            }
        }

        // Fallback 3: Extract from page title (document.title)
        try {
            const pageTitle = await this.page.title();
            if (pageTitle && pageTitle !== 'Flipkart') {
                // Clean up the page title (remove "Online at Best Price On Flipkart.com" etc.)
                const cleanTitle = pageTitle
                    .replace(/\s*(?:online at best price|buy|shop).*$/i, '')
                    .replace(/\s*\|\s*flipkart.*/i, '')
                    .trim();
                
                if (cleanTitle.length > 5) {
                    logger.info('Title extracted from page title', { cleanTitle });
                    return cleanTitle;
                }
            }
        } catch (e) {
            logger.warn('Failed to extract from page title', { error: e.message });
        }

        // Fallback 4: Extract from meta tags
        try {
            const metaTitle = await this.page.evaluate(() => {
                const ogTitle = document.querySelector('meta[property="og:title"]');
                const twitterTitle = document.querySelector('meta[name="twitter:title"]');
                return ogTitle?.content || twitterTitle?.content || null;
            });
            
            if (metaTitle && metaTitle.length > 5) {
                logger.info('Title extracted from meta tags', { metaTitle });
                return metaTitle;
            }
        } catch (e) {
            logger.warn('Failed to extract from meta tags', { error: e.message });
        }

        // Fallback 5: Extract from breadcrumbs or first large text element
        try {
            const breadcrumbTitle = await this.page.evaluate(() => {
                // Try breadcrumb (last item is usually product name)
                const breadcrumbs = Array.from(document.querySelectorAll('[class*="breadcrumb"] a, [class*="Breadcrumb"] a'));
                if (breadcrumbs.length > 0) {
                    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
                    const text = lastCrumb.textContent?.trim();
                    if (text && text.length > 5) return text;
                }
                
                // Try to find any large span/div with product-like text (>20 chars, not navigation)
                const textElements = Array.from(document.querySelectorAll('span, div'));
                for (const el of textElements) {
                    const text = el.textContent?.trim();
                    // Must be long enough, not a navigation item
                    if (text && text.length > 20 && text.length < 200 && 
                        !text.includes('Login') && !text.includes('Cart') && 
                        !text.includes('More') && !text.includes('Search')) {
                        return text;
                    }
                }
                
                return null;
            });
            
            if (breadcrumbTitle) {
                logger.info('Title extracted from DOM search', { breadcrumbTitle });
                return breadcrumbTitle;
            }
        } catch (e) {
            logger.warn('Failed to extract from DOM', { error: e.message });
        }

        logger.warn('Title not found with any method, using default');
        return 'Unknown Product';
    }

    /**
     * Extract product price
     */
    async getPrice() {
        // Try partial class matching first (more stable)
        const priceSelectors = [
            'div.Nx9bqj',
            '[class*="30jeq"]',
            '[class*="price"]',
            '._30jeq3'
        ];

        for (const selector of priceSelectors) {
            const priceText = await this.getTextContent(selector);
            if (priceText) {
                const price = this.extractPrice(priceText);
                if (price) {
                    logger.info('Price extracted', { selector, price });
                    return price;
                }
            }
        }

        // Fallback: Search body text for rupee symbol
        try {
            const price = await this.page.evaluate(() => {
                const allText = document.body.innerText;
                const priceMatch = allText.match(/₹\s*[\d,]+/);
                return priceMatch ? priceMatch[0] : null;
            });
            
            if (price) {
                const extracted = this.extractPrice(price);
                if (extracted) {
                    logger.info('Price extracted from body text', { price: extracted });
                    return extracted;
                }
            }
        } catch (e) {
            logger.warn('Failed to extract price from body', { error: e.message });
        }

        logger.warn('Price not found on Flipkart product page');
        return null;
    }

    /**
     * Extract product image URL
     */
    async getImageUrl() {
        // Try semantic img[alt] first
        const imgWithAlt = await this.page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img[alt]'));
            const productImg = imgs.find(img => 
                img.alt && img.alt.length > 10 && 
                img.src.includes('flipkart') &&
                !img.src.includes('logo')
            );
            return productImg?.src || null;
        });

        if (imgWithAlt) {
            logger.info('Image URL extracted from alt');
            return imgWithAlt;
        }

        // Try finding large product image from DOM
        try {
            const imageUrl = await this.page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                // Find large image from Flipkart CDN
                for (const img of images) {
                    const src = img.src || img.getAttribute('src');
                    if (src && (src.includes('flixcart.com') || src.includes('flipkart')) 
                        && !src.includes('logo') && !src.includes('icon') 
                        && img.width > 100) {
                        return src;
                    }
                }
                return null;
            });
            
            if (imageUrl) {
                logger.info('Image URL extracted from DOM search');
                return imageUrl;
            }
        } catch (e) {
            logger.warn('Failed to extract image from DOM', { error: e.message });
        }

        logger.warn('Image URL not found');
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

            // Wait for dynamic content to load
            await this.page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});

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
