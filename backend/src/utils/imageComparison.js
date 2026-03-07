import axios from 'axios';
import https from 'https';
import sharp from 'sharp';
import { imageHash } from 'image-hash';
import { promisify } from 'util';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import pLimit from 'p-limit';
import Logger from './logger.js';

const logger = new Logger('ImageComparison');
const imageHashAsync = promisify(imageHash);

// Create HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

/**
 * Image Comparison Utility for Product Matching
 * Uses perceptual hashing to compare product images
 */
class ImageComparison {
    /**
     * Download image from URL with timeout
     * @param {string} imageUrl - URL of the image
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Buffer>} - Image buffer
     */
    static async downloadImage(imageUrl, timeout = 10000) {
        try {
            logger.info('Downloading image', { imageUrl });
            
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                maxContentLength: 10 * 1024 * 1024, // 10MB max
                httpsAgent, // Use the configured HTTPS agent
            });

            return Buffer.from(response.data);
        } catch (error) {
            logger.error('Failed to download image', { imageUrl, error: error.message });
            throw new Error(`Image download failed: ${error.message}`);
        }
    }

    /**
     * Preprocess image for consistent comparison
     * @param {Buffer} imageBuffer - Raw image buffer
     * @returns {Promise<Buffer>} - Processed image buffer
     */
    static async preprocessImage(imageBuffer) {
        try {
            // Resize to standard size and convert to RGB
            const processed = await sharp(imageBuffer)
                .resize(256, 256, {
                    fit: 'inside',
                    withoutEnlargement: false,
                })
                .removeAlpha() // Remove alpha channel
                .jpeg({ quality: 80 }) // Normalize format
                .toBuffer();

            return processed;
        } catch (error) {
            logger.error('Image preprocessing failed', { error: error.message });
            throw new Error(`Image preprocessing failed: ${error.message}`);
        }
    }

    /**
     * Generate perceptual hash for an image
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<string>} - Perceptual hash
     */
    static async generateHash(imageBuffer) {
        let tempFilePath = null;
        
        try {
            const processed = await this.preprocessImage(imageBuffer);
            
            // Create temporary directory
            const tempDir = await mkdtemp(join(tmpdir(), 'img-hash-'));
            tempFilePath = join(tempDir, 'temp-image.jpg');
            
            // Write buffer to temporary file
            await writeFile(tempFilePath, processed);
            
            // Generate hash from file path
            const hash = await imageHashAsync(tempFilePath, 16, true);
            
            logger.info('Generated image hash', { hash });
            return hash;
        } catch (error) {
            logger.error('Hash generation failed', { error: error.message });
            throw new Error(`Hash generation failed: ${error.message}`);
        } finally {
            // Clean up temporary file
            if (tempFilePath) {
                try {
                    await unlink(tempFilePath);
                } catch (err) {
                    logger.warn('Failed to delete temp file', { tempFilePath });
                }
            }
        }
    }

    /**
     * Calculate Hamming distance between two binary strings
     * @param {string} hash1 - First hash
     * @param {string} hash2 - Second hash
     * @returns {number} - Hamming distance
     */
    static hammingDistance(hash1, hash2) {
        if (hash1.length !== hash2.length) {
            throw new Error('Hash lengths must be equal');
        }

        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            if (hash1[i] !== hash2[i]) {
                distance++;
            }
        }
        return distance;
    }

    /**
     * Calculate similarity percentage between two hashes
     * @param {string} hash1 - First hash
     * @param {string} hash2 - Second hash
     * @returns {number} - Similarity percentage (0-100)
     */
    static calculateSimilarity(hash1, hash2) {
        try {
            const distance = this.hammingDistance(hash1, hash2);
            const maxDistance = hash1.length;
            const similarity = ((maxDistance - distance) / maxDistance) * 100;
            
            return Math.round(similarity * 100) / 100; // Round to 2 decimals
        } catch (error) {
            logger.error('Similarity calculation failed', { error: error.message });
            return 0;
        }
    }

    /**
     * Compare two images and return similarity score
     * @param {string} imageUrl1 - First image URL
     * @param {string} imageUrl2 - Second image URL
     * @returns {Promise<Object>} - Comparison result with similarity score
     */
    static async compareImages(imageUrl1, imageUrl2) {
        const startTime = Date.now();
        
        try {
            logger.info('Comparing images', { imageUrl1, imageUrl2 });

            // Download both images in parallel
            const [buffer1, buffer2] = await Promise.all([
                this.downloadImage(imageUrl1),
                this.downloadImage(imageUrl2),
            ]);

            // Generate hashes
            const [hash1, hash2] = await Promise.all([
                this.generateHash(buffer1),
                this.generateHash(buffer2),
            ]);

            // Calculate similarity
            const similarity = this.calculateSimilarity(hash1, hash2);
            const duration = Date.now() - startTime;

            logger.info('Image comparison complete', { 
                similarity, 
                duration: `${duration}ms` 
            });

            return {
                similarity,
                hash1,
                hash2,
                isMatch: similarity >= 70, // Threshold for match
                duration,
            };
        } catch (error) {
            logger.error('Image comparison failed', { 
                imageUrl1, 
                imageUrl2, 
                error: error.message 
            });
            
            return {
                similarity: 0,
                hash1: null,
                hash2: null,
                isMatch: false,
                error: error.message,
                duration: Date.now() - startTime,
            };
        }
    }

    /**
     * Batch compare one source image with multiple target images
     * @param {string} sourceImageUrl - Source image URL
     * @param {Array<string>} targetImageUrls - Array of target image URLs
     * @param {number} minSimilarity - Minimum similarity threshold (default: 70)
     * @returns {Promise<Array>} - Array of comparison results
     */
    static async batchCompare(sourceImageUrl, targetImageUrls, minSimilarity = 70) {
        try {
            logger.info('Starting batch image comparison', { 
                sourceImageUrl, 
                targetCount: targetImageUrls.length 
            });

            // Download and hash source image once
            const sourceBuffer = await this.downloadImage(sourceImageUrl);
            const sourceHash = await this.generateHash(sourceBuffer);

            // Use concurrency limit to avoid memory explosion
            const limit = pLimit(5); // Process max 5 images simultaneously

            // Compare with all target images
            const results = await Promise.all(
                targetImageUrls.map((targetUrl, index) => limit(async () => {
                    try {
                        const targetBuffer = await this.downloadImage(targetUrl);
                        const targetHash = await this.generateHash(targetBuffer);
                        const similarity = this.calculateSimilarity(sourceHash, targetHash);

                        return {
                            index,
                            targetUrl,
                            similarity,
                            isMatch: similarity >= minSimilarity,
                        };
                    } catch (error) {
                        logger.warn('Failed to compare with target image', { 
                            targetUrl, 
                            error: error.message 
                        });
                        
                        return {
                            index,
                            targetUrl,
                            similarity: 0,
                            isMatch: false,
                            error: error.message,
                        };
                    }
                }))
            );

            // Filter and sort by similarity
            const matches = results
                .filter(r => r.isMatch)
                .sort((a, b) => b.similarity - a.similarity);

            logger.info('Batch comparison complete', { 
                totalCompared: results.length,
                matchesFound: matches.length 
            });

            return {
                sourceUrl: sourceImageUrl,
                sourceHash,
                results,
                matches,
                totalCompared: results.length,
                matchesFound: matches.length,
            };
        } catch (error) {
            logger.error('Batch comparison failed', { error: error.message });
            throw error;
        }
    }
}

export default ImageComparison;
