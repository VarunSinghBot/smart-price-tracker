import app from "./app.js";
import priceScheduler from "./utils/scheduler.js";
import Logger from "./utils/logger.js";

const logger = new Logger('Server');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Start price update scheduler
  if (process.env.ENABLE_SCHEDULER !== 'false') {
    logger.info('Starting automated price update scheduler...');
    priceScheduler.start();
  } else {
    logger.info('Scheduler disabled via ENABLE_SCHEDULER environment variable');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  priceScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  priceScheduler.stop();
  process.exit(0);
});