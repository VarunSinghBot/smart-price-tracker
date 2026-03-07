import stringSimilarity from 'string-similarity';
import natural from 'natural';
import leven from 'leven';
import Logger from './logger.js';

const logger = new Logger('TextSimilarity');

/**
 * Text Similarity Utility for Product Title Matching
 */
class TextSimilarity {
    /**
     * Normalize product title for comparison
     * @param {string} title - Product title
     * @returns {string} - Normalized title
     */
    static normalizeTitle(title) {
        if (!title) return '';
        
        return title
            .toLowerCase()
            .replace(/[®™©]/g, '') // Remove trademark symbols
            .replace(/\([^)]*\)/g, '') // Remove parentheses content
            .replace(/\[[^\]]*\]/g, '') // Remove bracket content
            .replace(/[^\w\s]/g, ' ') // Remove special chars
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    /**
     * Extract model number from product title
     * @param {string} title - Product title
     * @returns {string|null} - Extracted model number or null
     */
    static extractModelNumber(title) {
        if (!title) return null;
        
        // Common patterns for model numbers
        const patterns = [
            // iPhone patterns: iPhone 15, iPhone 15 Pro Max
            /iphone\s+(\d+)(?:\s+(pro|plus|mini|max))?/i,
            // Galaxy patterns: Galaxy S23, S23 Ultra
            /galaxy\s+([a-z]\d+)(?:\s+(ultra|plus|fe))?/i,
            // Generic model: Model123, ABC-123
            /(?:model[:\s]*)([a-z0-9-]+)/i,
            // SKU patterns: SKU: ABC123
            /(?:sku[:\s]*)([a-z0-9-]+)/i,
            // Part number patterns
            /(?:part[:\s#]*)([a-z0-9-]+)/i,
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                return match[0].trim().toLowerCase();
            }
        }
        
        return null;
    }

    /**
     * Calculate token overlap between two titles (cheap pre-filter)
     * @param {string} title1 - First title
     * @param {string} title2 - Second title
     * @returns {number} - Number of overlapping tokens
     */
    static calculateTokenOverlap(title1, title2) {
        const tokens1 = new Set(this.extractKeywords(title1));
        const tokens2 = new Set(this.extractKeywords(title2));
        
        let overlap = 0;
        for (const token of tokens1) {
            if (tokens2.has(token)) {
                overlap++;
            }
        }
        
        return overlap;
    }

    /**
     * Rank products by text similarity (cheap pre-filter before image comparison)
     * @param {string} sourceTitle - Source product title
     * @param {Array} products - Products to rank
     * @returns {Array} - Ranked products with similarity scores
     */
    static rankBySimilarity(sourceTitle, products) {
        return products
            .map(product => {
                const similarity = this.calculateSimilarity(sourceTitle, product.title);
                return {
                    ...product,
                    textSimilarity: similarity.similarity,
                    textAnalysis: similarity,
                };
            })
            .sort((a, b) => b.textSimilarity - a.textSimilarity);
    }

    /**
     * Extract brand from product title
     * @param {string} title - Product title
     * @returns {string|null} - Extracted brand or null
     */
    static extractBrand(title) {
        const commonBrands = [
            'apple', 'samsung', 'sony', 'lg', 'dell', 'hp', 'lenovo',
            'asus', 'acer', 'microsoft', 'google', 'oneplus', 'xiaomi',
            'realme', 'oppo', 'vivo', 'motorola', 'nokia', 'huawei',
            'nike', 'adidas', 'puma', 'reebok', 'under armour',
            'bosch', 'philips', 'panasonic', 'whirlpool', 'boat',
        ];

        const normalized = this.normalizeTitle(title);
        const words = normalized.split(' ');

        // Special case: iPhone/iPad/MacBook = Apple
        if (/iphone|ipad|macbook|airpods|apple watch/i.test(title)) {
            return 'apple';
        }

        // Check first 3 words for brand name
        for (const word of words.slice(0, 3)) {
            if (commonBrands.includes(word)) {
                return word;
            }
        }

        return null;
    }

    /**
     * Extract keywords from product title
     * @param {string} title - Product title
     * @returns {Array<string>} - Array of keywords
     */
    static extractKeywords(title) {
        const normalized = this.normalizeTitle(title);
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(normalized);

        // Remove common stop words and noise words
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
            'pack', 'set', 'combo', 'offer', 'sale', 'new', 'latest', 'original',
            'best', 'any', 'ever', 'all', 'store', 'free', 'now', 'hot',
            'display', 'chip', 'battery', 'life', 'camera', 'system', 'front', 'stage', 'center',
        ]);

        return tokens.filter(token => 
            token.length > 2 && !stopWords.has(token)
        );
    }

    /**
     * Calculate Dice's coefficient similarity (0-100)
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} - Similarity percentage
     */
    static diceCoefficient(str1, str2) {
        const normalized1 = this.normalizeTitle(str1);
        const normalized2 = this.normalizeTitle(str2);
        
        const similarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
        return Math.round(similarity * 100 * 100) / 100; // Convert to percentage
    }

    /**
     * Calculate Levenshtein distance similarity (0-100)
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} - Similarity percentage
     */
    static levenshteinSimilarity(str1, str2) {
        const normalized1 = this.normalizeTitle(str1);
        const normalized2 = this.normalizeTitle(str2);
        
        if (!normalized1 || !normalized2) return 0;
        
        const distance = leven(normalized1, normalized2);
        const maxLength = Math.max(normalized1.length, normalized2.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;
        
        return Math.round(similarity * 100) / 100;
    }

    /**
     * Calculate Jaccard similarity based on keywords (0-100)
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} - Similarity percentage
     */
    static jaccardSimilarity(str1, str2) {
        const keywords1 = new Set(this.extractKeywords(str1));
        const keywords2 = new Set(this.extractKeywords(str2));

        if (keywords1.size === 0 || keywords2.size === 0) return 0;

        const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
        const union = new Set([...keywords1, ...keywords2]);

        const similarity = (intersection.size / union.size) * 100;
        return Math.round(similarity * 100) / 100;
    }

    /**
     * Calculate comprehensive similarity score using multiple algorithms
     * @param {string} title1 - First product title
     * @param {string} title2 - Second product title
     * @returns {Object} - Detailed similarity analysis
     */
    static calculateSimilarity(title1, title2) {
        try {
            logger.info('Calculating text similarity', { title1, title2 });

            // Calculate different similarity metrics
            const diceSimilarity = this.diceCoefficient(title1, title2);
            const levenshteinSimilarity = this.levenshteinSimilarity(title1, title2);
            const jaccardSimilarity = this.jaccardSimilarity(title1, title2);

            // Extract brands for exact matching
            const brand1 = this.extractBrand(title1);
            const brand2 = this.extractBrand(title2);
            const brandMatch = brand1 && brand2 && brand1 === brand2;

            // Weighted average (Dice has highest weight)
            const overallSimilarity = (
                diceSimilarity * 0.5 +
                levenshteinSimilarity * 0.3 +
                jaccardSimilarity * 0.2
            );

            // Boost score if brands match
            const finalScore = brandMatch 
                ? Math.min(overallSimilarity + 10, 100) 
                : overallSimilarity;

            const result = {
                similarity: Math.round(finalScore * 100) / 100,
                breakdown: {
                    dice: diceSimilarity,
                    levenshtein: levenshteinSimilarity,
                    jaccard: jaccardSimilarity,
                },
                brandMatch,
                brands: {
                    title1: brand1,
                    title2: brand2,
                },
                isMatch: finalScore >= 65, // Threshold for text match
            };

            logger.info('Text similarity calculated', { result });
            return result;
        } catch (error) {
            logger.error('Text similarity calculation failed', { 
                title1, 
                title2, 
                error: error.message 
            });
            
            return {
                similarity: 0,
                breakdown: {},
                brandMatch: false,
                brands: {},
                isMatch: false,
                error: error.message,
            };
        }
    }

    /**
     * Find best match from a list of titles
     * @param {string} sourceTitle - Source title to match
     * @param {Array<Object>} targets - Array of {title, ...} objects
     * @param {number} minSimilarity - Minimum similarity threshold
     * @returns {Array<Object>} - Sorted array of matches with scores
     */
    static findBestMatches(sourceTitle, targets, minSimilarity = 65) {
        try {
            logger.info('Finding best matches', { 
                sourceTitle, 
                targetCount: targets.length 
            });

            const results = targets.map((target, index) => {
                const analysis = this.calculateSimilarity(sourceTitle, target.title);
                
                return {
                    ...target,
                    index,
                    textSimilarity: analysis.similarity,
                    textAnalysis: analysis,
                    isTextMatch: analysis.isMatch,
                };
            });

            // Filter and sort
            const matches = results
                .filter(r => r.textSimilarity >= minSimilarity)
                .sort((a, b) => b.textSimilarity - a.textSimilarity);

            logger.info('Best matches found', { 
                totalChecked: results.length,
                matchesFound: matches.length 
            });

            return matches;
        } catch (error) {
            logger.error('Find best matches failed', { error: error.message });
            return [];
        }
    }
}

export default TextSimilarity;
