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
     * Match search results with staged strategy:
     * 1) Title-first matching.
     * 2) If no title matches, fallback to image-only matching.
     * 3) If both title+image are available, rank candidates that are strong on both.
     * @param {Object} sourceProduct - Source product data
     * @param {Array} searchResults - Search results to match
     * @param {number} minConfidence - Minimum confidence threshold
     * @returns {Promise<Array>} - Matched products with confidence scores
     */
    static async matchProducts(sourceProduct, searchResults, minConfidence = 70) {
        try {
            logger.info('Matching products (title-first)', {
                sourceTitle: sourceProduct.title,
                candidateCount: searchResults.length
            });

            const isDev = process.env.NODE_ENV !== 'production';
            const titleMatchThreshold = Math.max(55, minConfidence * 0.7);
            const imageFallbackThreshold = 45;

            if (searchResults.length === 0) {
                return [];
            }

            // Extract source metadata
            const sourceModel = TextSimilarity.extractModelNumber(sourceProduct.title);
            const sourceBrand = sourceProduct.metadata?.brand || TextSimilarity.extractBrand(sourceProduct.title);
            const sourceCategory = TextSimilarity.inferCategory(sourceProduct.title);

            // === STAGE 1: Title-first ranking ===
            const textRankedAll = TextSimilarity.rankBySimilarity(
                sourceProduct.title,
                searchResults
            );

            const titleMatches = textRankedAll
                .filter(candidate => candidate.textSimilarity >= titleMatchThreshold)
                .slice(0, 8);

            logger.info('Title matching complete', {
                titleMatchThreshold,
                totalRanked: textRankedAll.length,
                titleMatches: titleMatches.length,
            });

            const candidatesForEvaluation =
                titleMatches.length > 0 ? titleMatches : textRankedAll.slice(0, 8);

            const withImages = candidatesForEvaluation.filter(candidate => candidate.imageUrl);

            let imageResultMap = new Map();
            if (withImages.length > 0) {
                const imageUrls = withImages.map(candidate => candidate.imageUrl);
                const imageComparison = await ImageComparison.batchCompare(
                    sourceProduct.imageUrl,
                    imageUrls,
                    0
                );

                imageComparison.results.forEach((result, idx) => {
                    imageResultMap.set(withImages[idx].imageUrl, result);
                });
            }

            const matches = [];

            for (const product of candidatesForEvaluation) {
                const imageResult = product.imageUrl ? imageResultMap.get(product.imageUrl) : null;
                const imageScore = imageResult ? imageResult.similarity : null;
                const candidateCategory = TextSimilarity.inferCategory(product.title);
                const categoryConflict =
                    !!sourceCategory && !!candidateCategory && sourceCategory !== candidateCategory;

                const matchDebug = {
                    candidateTitle: product.title,
                    imageScore,
                    textScore: product.textSimilarity,
                    finalScore: null,
                    categoryConflict,
                    rejectedReason: null,
                };

                if (categoryConflict) {
                    matchDebug.rejectedReason = 'category_conflict';
                    if (isDev) {
                        console.log('[MatcherDebug]', matchDebug);
                    }
                    continue;
                }

                // Image fallback mode: title match not found, rely on image threshold.
                const isImageFallbackMode = titleMatches.length === 0;
                if (isImageFallbackMode && (imageScore === null || imageScore < imageFallbackThreshold)) {
                    matchDebug.rejectedReason = imageScore === null ? 'no_image' : 'low_image';
                    if (isDev) {
                        console.log('[MatcherDebug]', matchDebug);
                    }
                    continue;
                }
                
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
                const effectiveImageScore = imageScore ?? 0;
                const confidenceResult = this.calculateConfidence({
                    imageSimilarity: effectiveImageScore,
                    textSimilarity: product.textSimilarity,
                    brandMatch,
                    modelMatch,
                    priceDiff,
                    sourcePrice: sourceProduct.currentPrice,
                    candidatePrice: product.price
                });

                // If both text and image exist, boost candidates that are strong on both.
                let finalScore = confidenceResult.confidence;
                if (imageScore !== null) {
                    const bothStrongScore = Math.round(((product.textSimilarity * 0.5) + (imageScore * 0.5)) * 100) / 100;
                    finalScore = Math.round(((confidenceResult.confidence * 0.7) + (bothStrongScore * 0.3)) * 100) / 100;
                }

                // Model number match = near-perfect match
                if (modelMatch) {
                    logger.info('Model number match found!', { 
                        sourceModel, 
                        candidateModel,
                        confidence: finalScore
                    });
                }

                matchDebug.finalScore = finalScore;

                // Only include if confidence meets threshold
                const threshold = isImageFallbackMode ? imageFallbackThreshold : minConfidence;
                if (finalScore >= threshold) {
                    if (isDev) {
                        console.log('[MatcherDebug]', matchDebug);
                    }

                    matches.push({
                        ...product,
                        confidence: finalScore,
                        confidenceExplanation: confidenceResult.explanation,
                        imageSimilarity: imageScore,
                        imageHashScores: imageResult.hashScores || null,
                        textSimilarity: product.textSimilarity,
                        textAnalysis: product.textAnalysis,
                        brandMatch,
                        modelMatch,
                        priceDiff: priceDiff ? Math.round(priceDiff * 100) : null,
                        matchMethod: isImageFallbackMode ? 'image-fallback' : (imageScore !== null ? 'title-image-combined' : 'title-only'),
                    });
                } else {
                    matchDebug.rejectedReason = 'below_threshold';
                    if (isDev) {
                        console.log('[MatcherDebug]', matchDebug);
                    }
                }
            }

            // Sort by confidence
            matches.sort((a, b) => b.confidence - a.confidence);

            logger.info('Product matching complete', { 
                titleMatches: titleMatches.length,
                evaluatedCandidates: candidatesForEvaluation.length,
                imagesCompared: withImages.length,
                mode: titleMatches.length > 0 ? 'title-first' : 'image-fallback',
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
