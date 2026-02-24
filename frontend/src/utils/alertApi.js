import api from './api';

/**
 * Alert API Service
 */

// Create a new price alert
export const createAlert = async (productId, targetPrice) => {
    const response = await api.post('/alerts', { productId, targetPrice });
    return response.data;
};

// Get all alerts
export const getAlerts = async (activeOnly = true) => {
    const response = await api.get('/alerts', {
        params: { activeOnly }
    });
    return response.data;
};

// Update an alert
export const updateAlert = async (alertId, updates) => {
    const response = await api.patch(`/alerts/${alertId}`, updates);
    return response.data;
};

// Delete an alert
export const deleteAlert = async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
};

// Deactivate an alert
export const deactivateAlert = async (alertId) => {
    const response = await api.post(`/alerts/${alertId}/deactivate`);
    return response.data;
};

export default {
    createAlert,
    getAlerts,
    updateAlert,
    deleteAlert,
    deactivateAlert,
};
