import ScraperFactory from '../utils/scrapers/ScraperFactory.js';
import AmazonSearchScraper from '../utils/scrapers/AmazonSearchScraper.js';
import FlipkartSearchScraper from '../utils/scrapers/FlipkartSearchScraper.js';
import EbaySearchScraper from '../utils/scrapers/EbaySearchScraper.js';
import ImageComparison from '../utils/imageComparison.js';
import TextSimilarity from '../utils/textSimilarity.js';
import pLimit from 'p-limit';
import Logger from '../utils/logger.js';

const logger = new Logger('ProductMatcherService');

/**
 * Product Matcher Service
 * Finds the same product across different e-commerce platforms
 * using image and text similarity matching
 */
class ProductMatcherService {
    /**
     * Get appropriate search scraper for platform
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
                throw new Error(`No search scraper available for platform: ${platform}`);
        }
    }

    /**
     * Generate search query from product data
     * @param {Object} productData - Scraped product data
     * @returns {string} - Optimized search query
     */
    static generateSearchQuery(productData) {
        const { title, metadata } = productData;
        
        // Clean title by removing promotional/descriptive phrases
        let cleanTitle = title
            .replace(/\([\d.]+ *(?:cm|inch|inches|"|″)\)/gi, '') // Remove size specs
            .replace(/\d+\.\d+ *(?:cm|inch|inches|"|″)/gi, '') // Remove size numbers
            .replace(/:\s+/g, ' ') // Replace colons with space
            .replace(/;/g, ',') // Replace semicolons
            .split(/[,;]/)[0] // Take first part before comma/semicolon
            .replace(/with.*$/gi, '') // Remove "with X" at end
            .replace(/(?:best|great|amazing|perfect|premium|original|latest|new|ever|any)\s+/gi, ' ') // Remove promotional adjectives
            .replace(/[()[\]{}]/g, ' ') // Remove brackets
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        // Extract brand
        const brand = metadata?.brand || TextSimilarity.extractBrand(title);
        
        // For iPhones, use a simpler pattern: iPhone + model
        const iphoneMatch = title.match(/iphone\s+(\d+)\s+(pro\s+max|pro|plus|mini)?/i);
        if (iphoneMatch) {
            const model = iphoneMatch[0]; // "iPhone 17 Pro Max"
            const storageMatch = title.match(/(\d+\s*(?:GB|TB))/i);
            const storage = storageMatch ? storageMatch[1].replace(/\s+/g, '') : '';
            
            let query = model.trim();
            if (storage) query += ` ${storage}`;
            
            logger.info('Generated iPhone search query', { 
                originalTitle: title,
                query 
            });
            
            return query;
        }
        
        // For other products, extract key features
        const keywords = TextSimilarity.extractKeywords(cleanTitle);
        const relevantKeywords = keywords.slice(0, 4); // Take first 4 meaningful words
        
        let query = brand ? `${brand} ` : '';
        query += relevantKeywords.join(' ');
        
        logger.info('Generated search query', { 
            originalTitle: title,
            cleanTitle,
            query 
        });
        
        return query;
    }

    /**
     * Search for products on a specific platform
     * @param {string} platform - Platform name
     * @param {string} searchQuery - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} - Array of search results
     */
    static async searchOnPlatform(platform, searchQuery, limit = 5) {
        try {
            logger.info('Searching platform', { platform, searchQuery });
            
            const scraper = this.getSearchScraper(platform);
            const results = await scraper.searchProducts(searchQuery, limit);
            
            logger.info('Platform search complete', { 
                platform, 
                resultsFound: results.length 
            });
            
            return results;
        } catch (error) {
            logger.error('Platform search failed', { 
                platform, 
                error: error.message 
            });
            return [];
        }
    }

    /**
     * Calculate confidence score for a product match with smart weighting
     * @param {Object} params - Match parameters
     * @returns {Object} - Confidence score and explanation
     */
    static calculateConfidence(params) {
        const { 
            imageSimilarity, 
            textSimilarity, 
            brandMatch, 
            modelMatch,
            priceDiff,
            sourcePrice,
            candidatePrice
        } = params;
        
        let score = 0;
        const explanation = [];
        
        // Image similarity (45% weight)
        score += imageSimilarity * 0.45;
        explanation.push(`Image: ${imageSimilarity.toFixed(1)}% × 0.45`);
        
        // Text similarity (30% weight)
        score += textSimilarity * 0.30;
        explanation.push(`Text: ${textSimilarity.toFixed(1)}% × 0.30`);
        
        // Brand match bonus (10 points)
        if (brandMatch) {
            score += 10;
            explanation.push('Brand match: +10');
        }
        
        // Model number match (15 points - very strong signal)
        if (modelMatch) {
            score += 15;
            explanation.push('Model match: +15');
        }
        
        // Price similarity bonus (max 10 points)
        if (sourcePrice && candidatePrice && priceDiff !== undefined) {
            const priceBonus = Math.max(0, 10 * (1 - priceDiff));
            score += priceBonus;
            explanation.push(`Price diff ${(priceDiff * 100).toFixed(1)}%: +${priceBonus.toFixed(1)}`);
        }
        
        const finalScore = Math.min(100, Math.round(score * 100) / 100);
        
        return {
            confidence: finalScore,
            explanation: explanation.join(', ')
        };
    }

    /**
     * Match search results with source product using 2-stage matching
     * Stage 1: Text pre-filter (cheap)
     * Stage 2: Image comparison only on top candidates
     * @param {Object} sourceProduct - Source product data
     * @param {Array} searchResults - Search results to match
     * @param {number} minConfidence - Minimum confidence threshold
     * @returns {Promise<Array>} - Matched products with confidence scores
     */
    static async matchProducts(sourceProduct, searchResults, minConfidence = 70) {
        try {
            logger.info('Matching products (2-stage)', { 
                sourceTitle: sourceProduct.title,
                candidateCount: searchResults.length 
            });

            if (searchResults.length === 0) {
                return [];
            }

            // Extract source metadata
            const sourceModel = TextSimilarity.extractModelNumber(sourceProduct.title);
            const sourceBrand = sourceProduct.metadata?.brand || TextSimilarity.extractBrand(sourceProduct.title);

            // === STAGE 1: Text Pre-Filter (Cheap) ===
            logger.info('Stage 1: Text pre-filtering candidates');
            
            // Quick token overlap check - skip candidates with < 3 overlapping tokens
            const tokenFiltered = searchResults.filter(candidate => {
                const overlap = TextSimilarity.calculateTokenOverlap(
                    sourceProduct.title,
                    candidate.title
                );
                return overlap >= 3;
            });
            
            logger.info('Token overlap filtering', { 
                before: searchResults.length,
                after: tokenFiltered.length 
            });

            // Rank by text similarity and take top 3-4
            const textRanked = TextSimilarity.rankBySimilarity(
                sourceProduct.title,
                tokenFiltered
            ).slice(0, 4); // Only top 4 candidates

            logger.info('Text ranking complete', { topCandidates: textRanked.length });

            if (textRanked.length === 0) {
                logger.warn('No candidates passed text pre-filter');
                return [];
            }

            // === STAGE 2: Image Comparison Only on Top Candidates ===
            logger.info('Stage 2: Image comparison on top candidates');
            
            // Filter candidates that have images
            const withImages = textRanked.filter(r => r.imageUrl);
            
            if (withImages.length === 0) {
                logger.warn('No top candidates have images, using text-only matching');
                return textRanked
                    .filter(match => match.textSimilarity >= minConfidence * 0.7)
                    .map(match => ({
                        ...match,
                        confidence: match.textSimilarity,
                        imageSimilarity: null,
                        matchMethod: 'text-only',
                    }));
            }

            // Batch compare images (only 3-4 images now, not 15+)
            const imageUrls = withImages.map(r => r.imageUrl);
            const imageComparison = await ImageComparison.batchCompare(
                sourceProduct.imageUrl,
                imageUrls,
                50 // Lower threshold for initial filtering
            );

            // === Combine All Signals ===
            const matches = [];
            const imageResultMap = new Map(); // Fix array order issue
            
            imageComparison.results.forEach((result, idx) => {
                imageResultMap.set(withImages[idx].imageUrl, result);
            });

            for (const product of withImages) {
                const imageResult = imageResultMap.get(product.imageUrl);
                if (!imageResult) continue;
                
                // Extract candidate metadata
                const candidateModel = TextSimilarity.extractModelNumber(product.title);
                const candidateBrand = product.metadata?.brand || TextSimilarity.extractBrand(product.title);
                
                // Check matches
                const brandMatch = sourceBrand && candidateBrand && sourceBrand === candidateBrand;
                const modelMatch = sourceModel && candidateModel && sourceModel === candidateModel;
                
                // Calculate price difference
                let priceDiff = undefined;
                if (sourceProduct.currentPrice && product.price) {
                    priceDiff = Math.abs(sourceProduct.currentPrice - product.price) / sourceProduct.currentPrice;
                }

                // === Smart Confidence Calculation ===
                const confidenceResult = this.calculateConfidence({
                    imageSimilarity: imageResult.similarity,
                    textSimilarity: product.textSimilarity,
                    brandMatch,
                    modelMatch,
                    priceDiff,
                    sourcePrice: sourceProduct.currentPrice,
                    candidatePrice: product.price
                });

                // Model number match = near-perfect match
                if (modelMatch) {
                    logger.info('Model number match found!', { 
                        sourceModel, 
                        candidateModel,
                        confidence: confidenceResult.confidence
                    });
                }

                // Only include if confidence meets threshold
                if (confidenceResult.confidence >= minConfidence) {
                    matches.push({
                        ...product,
                        confidence: confidenceResult.confidence,
                        confidenceExplanation: confidenceResult.explanation,
                        imageSimilarity: imageResult.similarity,
                        textSimilarity: product.textSimilarity,
                        textAnalysis: product.textAnalysis,
                        brandMatch,
                        modelMatch,
                        priceDiff: priceDiff ? Math.round(priceDiff * 100) : null,
                        matchMethod: 'image-text-combined',
                    });
                }
            }

            // Sort by confidence
            matches.sort((a, b) => b.confidence - a.confidence);

            logger.info('Product matching complete', { 
                stage1Candidates: textRanked.length,
                stage2ImagesCompared: withImages.length,
                matchesFound: matches.length 
            });

            return matches;
        } catch (error) {
            logger.error('Product matching failed', { error: error.message });
            return [];
        }
    }

    /**
     * Find similar products across multiple platforms
     * @param {string} sourceUrl - Source product URL
     * @param {Array<string>} platforms - Platforms to search (default: all)
     * @param {Object} options - Search options
     * @returns {Promise<Object>} - Matching results
     */
    static async findSimilarProducts(sourceUrl, platforms = null, options = {}) {
        const startTime = Date.now();
        const {
            limit = 5,
            minConfidence = 60, // Lowered from 70 to 60 for better results
        } = options;

        try {
            logger.info('Starting cross-platform product search', { 
                sourceUrl, 
                platforms 
            });

            // Step 1: Scrape source product
            logger.info('Step 1: Scraping source product');
            const sourceProduct = await ScraperFactory.scrapeProduct(sourceUrl);
            
            if (!sourceProduct || !sourceProduct.imageUrl) {
                throw new Error('Failed to scrape source product or missing image');
            }

            // Step 2: Determine platforms to search
            const sourcePlatform = sourceProduct.platform.toLowerCase();
            const allPlatforms = ['amazon', 'flipkart', 'ebay'];
            
            // If platforms are specified, use them (including source platform for finding variants)
            // If not specified, search all platforms except source
            const targetPlatforms = platforms && platforms.length > 0
                ? platforms.map(p => p.toLowerCase()).filter(p => allPlatforms.includes(p))
                : allPlatforms.filter(p => p !== sourcePlatform);

            logger.info('Step 2: Platforms to search', { 
                sourcePlatform,
                targetPlatforms 
            });

            // Step 3: Generate search query
            const searchQuery = this.generateSearchQuery(sourceProduct);
            logger.info('Step 3: Generated search query', { searchQuery });

            // Step 4: Search all platforms with concurrency limit
            logger.info('Step 4: Searching all platforms (max 3 concurrent)');
            const limit_concurrent = pLimit(3); // Max 3 concurrent platform searches
            
            const searchPromises = targetPlatforms.map(platform =>
                limit_concurrent(() => this.searchOnPlatform(platform, searchQuery, limit))
            );
            const searchResults = await Promise.all(searchPromises);

            // Combine all search results with platform info
            const allResults = searchResults.flat();
            logger.info('Search results collected', { 
                totalResults: allResults.length 
            });

            // Step 5: Match products using image and text similarity
            logger.info('Step 5: Matching products');
            const matches = await this.matchProducts(
                sourceProduct,
                allResults,
                minConfidence
            );

            // Step 6: Group matches by platform
            const matchesByPlatform = {};
            targetPlatforms.forEach(platform => {
                matchesByPlatform[platform] = matches.filter(
                    m => m.platform.toLowerCase() === platform
                );
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.info('Cross-platform search complete', { 
                totalMatches: matches.length,
                duration: `${duration}s` 
            });

            return {
                sourceProduct: {
                    platform: sourceProduct.platform,
                    title: sourceProduct.title,
                    price: sourceProduct.currentPrice,
                    imageUrl: sourceProduct.imageUrl,
                    url: sourceUrl,
                },
                matches,
                matchesByPlatform,
                searchQuery,
                platformsSearched: targetPlatforms,
                totalMatches: matches.length,
                searchDuration: `${duration}s`,
            };
        } catch (error) {
            logger.error('Cross-platform search failed', { 
                sourceUrl, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get match quality label based on confidence score
     * @param {number} confidence - Confidence score (0-100)
     * @returns {string} - Quality label
     */
    static getMatchQuality(confidence) {
        if (confidence >= 85) return 'high';
        if (confidence >= 70) return 'medium';
        return 'low';
    }
}

export default ProductMatcherService;
