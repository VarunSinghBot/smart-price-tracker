import cron from 'node-cron';
import ScraperService from '../services/scraper.service.js';
import Logger from '../utils/logger.js';

const logger = new Logger('PriceScheduler');

/**
 * Scheduler for automated price updates
 */
class PriceScheduler {
    constructor() {
        this.jobs = [];
    }

    /**
     * Start all scheduled tasks
     */
    start() {
        logger.info('Starting price update scheduler...');

        // Update prices every 30 minutes
        const frequentUpdateJob = cron.schedule('*/30 * * * *', async () => {
            logger.info('Running frequent price update task (30 min)');
            try {
                const result = await ScraperService.bulkUpdateProducts(30);
                logger.info('Frequent update completed', result);
            } catch (error) {
                logger.error('Frequent update failed', { error: error.message });
            }
        });

        // Update more products every 2 hours
        const regularUpdateJob = cron.schedule('0 */2 * * *', async () => {
            logger.info('Running regular price update task (2 hours)');
            try {
                const result = await ScraperService.bulkUpdateProducts(100);
                logger.info('Regular update completed', result);
            } catch (error) {
                logger.error('Regular update failed', { error: error.message });
            }
        });

        // Daily comprehensive update at 2 AM
        const dailyUpdateJob = cron.schedule('0 2 * * *', async () => {
            logger.info('Running daily comprehensive update');
            try {
                const result = await ScraperService.bulkUpdateProducts(500);
                logger.info('Daily update completed', result);
            } catch (error) {
                logger.error('Daily update failed', { error: error.message });
            }
        });

        this.jobs = [frequentUpdateJob, regularUpdateJob, dailyUpdateJob];
        
        logger.info('Price scheduler started successfully');
        logger.info('Scheduled tasks:');
        logger.info('- Frequent updates: Every 30 minutes (30 products)');
        logger.info('- Regular updates: Every 2 hours (100 products)');
        logger.info('- Daily updates: Every day at 2 AM (500 products)');
    }

    /**
     * Stop all scheduled tasks
     */
    stop() {
        logger.info('Stopping price scheduler...');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        logger.info('Price scheduler stopped');
    }

    /**
     * Get status of scheduled tasks
     */
    getStatus() {
        return {
            running: this.jobs.length > 0,
            activeJobs: this.jobs.length
        };
    }
}

// Singleton instance
const priceScheduler = new PriceScheduler();

export default priceScheduler;
