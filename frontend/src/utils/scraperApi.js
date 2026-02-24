import api from './api';

/**
 * Scraper API Service
 */

// Get supported platforms
export const getSupportedPlatforms = async () => {
    const response = await api.get('/scraper/supported-platforms');
    return response.data;
};

// Scrape and track a new product
export const scrapeProduct = async (url) => {
    const response = await api.post('/scraper/scrape', { url });
    return response.data;
};

// Manually update product price
export const updateProductPrice = async (productId) => {
    const response = await api.post(`/scraper/update/${productId}`);
    return response.data;
};

// Bulk update products (admin/background)
export const bulkUpdateProducts = async (limit = 50) => {
    const response = await api.post('/scraper/bulk-update', { limit });
    return response.data;
};

// Scrape product from multiple platforms (preview mode, doesn't save)
export const scrapeMultiPlatform = async (urls) => {
    const response = await api.post('/scraper/scrape-multi-platform', { urls });
    return response.data;
};

// Search and scrape similar products on other platforms
export const searchCrossPlatform = async (url, platforms = null) => {
    const response = await api.post('/scraper/search-cross-platform', { url, platforms });
    return response.data;
};

export default {
    getSupportedPlatforms,
    scrapeProduct,
    updateProductPrice,
    bulkUpdateProducts,
    scrapeMultiPlatform,
    searchCrossPlatform,
};
