import api from './api';

/**
 * Product API Service
 */

// Get all tracked products
export const getProducts = async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
};

// Get product by ID with details and price history
export const getProductById = async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
};

// Get price history for a product
export const getPriceHistory = async (productId, days = 30) => {
    const response = await api.get(`/products/${productId}/price-history`, {
        params: { days }
    });
    return response.data;
};

// Get product statistics by platform
export const getProductsByPlatform = async () => {
    const response = await api.get('/products/stats/by-platform');
    return response.data;
};

// Delete a product
export const deleteProduct = async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
};

export default {
    getProducts,
    getProductById,
    getPriceHistory,
    getProductsByPlatform,
    deleteProduct,
};
