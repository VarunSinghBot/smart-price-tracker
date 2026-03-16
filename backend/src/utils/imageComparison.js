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
 * Uses a 3-hash ensemble (pHash + dHash + aHash) to compare product images
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
     * Generate perceptual hash (pHash) for an image
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<string>} - Binary pHash string
     */
    static async generatePHash(imageBuffer) {
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
            
            logger.info('Generated pHash');
            return hash;
        } catch (error) {
            logger.error('pHash generation failed', { error: error.message });
            throw new Error(`pHash generation failed: ${error.message}`);
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
     * Generate dHash by comparing adjacent grayscale pixels (9x8 -> 64 bits)
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<string>} - Binary dHash string
     */
    static async generateDHash(imageBuffer) {
        const raw = await sharp(imageBuffer)
            .resize(9, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer();

        let hash = '';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const left = raw[y * 9 + x];
                const right = raw[y * 9 + x + 1];
                hash += left > right ? '1' : '0';
            }
        }
        return hash;
    }

    /**
     * Generate aHash using average grayscale pixel value (8x8 -> 64 bits)
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<string>} - Binary aHash string
     */
    static async generateAHash(imageBuffer) {
        const raw = await sharp(imageBuffer)
            .resize(8, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer();

        const avg = raw.reduce((sum, val) => sum + val, 0) / raw.length;
        let hash = '';
        for (const pixel of raw) {
            hash += pixel >= avg ? '1' : '0';
        }
        return hash;
    }

    /**
     * Generate all hashes used in ensemble scoring
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<{pHash: string, dHash: string, aHash: string}>}
     */
    static async generateHashes(imageBuffer) {
        const [pHash, dHash, aHash] = await Promise.all([
            this.generatePHash(imageBuffer),
            this.generateDHash(imageBuffer),
            this.generateAHash(imageBuffer),
        ]);

        return { pHash, dHash, aHash };
    }

    /**
     * Backwards-compatible single-hash helper (pHash)
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<string>} - pHash
     */
    static async generateHash(imageBuffer) {
        return this.generatePHash(imageBuffer);
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
     * Calculate weighted ensemble similarity using pHash + dHash + aHash
     * dHash has highest weight to emphasize shape/structure differences.
     * @param {{pHash: string, dHash: string, aHash: string}} sourceHashes - Source hashes
     * @param {{pHash: string, dHash: string, aHash: string}} targetHashes - Target hashes
     * @returns {{similarity: number, scores: {pHash: number, dHash: number, aHash: number}}}
     */
    static calculateEnsembleSimilarity(sourceHashes, targetHashes) {
        const pScore = this.calculateSimilarity(sourceHashes.pHash, targetHashes.pHash);
        const dScore = this.calculateSimilarity(sourceHashes.dHash, targetHashes.dHash);
        const aScore = this.calculateSimilarity(sourceHashes.aHash, targetHashes.aHash);

        const similarity = Math.round((pScore * 0.25 + dScore * 0.5 + aScore * 0.25) * 100) / 100;

        return {
            similarity,
            scores: {
                pHash: pScore,
                dHash: dScore,
                aHash: aScore,
            },
        };
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

            // Generate hash ensembles
            const [hashes1, hashes2] = await Promise.all([
                this.generateHashes(buffer1),
                this.generateHashes(buffer2),
            ]);

            // Calculate weighted ensemble similarity
            const ensemble = this.calculateEnsembleSimilarity(hashes1, hashes2);
            const duration = Date.now() - startTime;

            logger.info('Image comparison complete', { 
                similarity: ensemble.similarity,
                duration: `${duration}ms` 
            });

            return {
                similarity: ensemble.similarity,
                hash1: hashes1.pHash,
                hash2: hashes2.pHash,
                hashScores: ensemble.scores,
                isMatch: ensemble.similarity >= 70, // Threshold for match
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
            const sourceHashes = await this.generateHashes(sourceBuffer);

            // Use concurrency limit to avoid memory explosion
            const limit = pLimit(5); // Process max 5 images simultaneously

            // Compare with all target images
            const results = await Promise.all(
                targetImageUrls.map((targetUrl, index) => limit(async () => {
                    try {
                        const targetBuffer = await this.downloadImage(targetUrl);
                        const targetHashes = await this.generateHashes(targetBuffer);
                        const ensemble = this.calculateEnsembleSimilarity(sourceHashes, targetHashes);

                        return {
                            index,
                            targetUrl,
                            similarity: ensemble.similarity,
                            hashScores: ensemble.scores,
                            isMatch: ensemble.similarity >= minSimilarity,
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
                sourceHash: sourceHashes.pHash,
                sourceHashes,
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
