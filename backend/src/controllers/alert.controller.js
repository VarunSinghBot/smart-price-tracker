import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import AlertService from '../services/alert.service.js';

/**
 * Controller for price alert operations
 */

/**
 * @route POST /api/v1/alerts
 * @desc Create a new price alert
 */
const createAlert = asyncHandler(async (req, res) => {
    const { productId, targetPrice } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    if (!productId || !targetPrice) {
        throw new ApiError(400, 'Product ID and target price are required');
    }

    if (typeof targetPrice !== 'number' || targetPrice <= 0) {
        throw new ApiError(400, 'Target price must be a positive number');
    }

    const alert = await AlertService.createAlert(userId, productId, targetPrice);

    return res.status(201).json(
        new ApiResponse(201, alert, 'Alert created successfully')
    );
});

/**
 * @route GET /api/v1/alerts
 * @desc Get all alerts for authenticated user
 */
const getUserAlerts = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { activeOnly = 'true' } = req.query;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const alerts = await AlertService.getUserAlerts(userId, activeOnly === 'true');

    return res.status(200).json(
        new ApiResponse(200, alerts, 'Alerts retrieved successfully')
    );
});

/**
 * @route PATCH /api/v1/alerts/:alertId
 * @desc Update an alert
 */
const updateAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    // Validate allowed fields for update
    const allowedFields = ['targetPrice', 'active'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
        throw new ApiError(400, 'No valid fields to update');
    }

    const filteredUpdates = {};
    updateFields.forEach(field => {
        filteredUpdates[field] = updates[field];
    });

    const alert = await AlertService.updateAlert(alertId, userId, filteredUpdates);

    return res.status(200).json(
        new ApiResponse(200, alert, 'Alert updated successfully')
    );
});

/**
 * @route DELETE /api/v1/alerts/:alertId
 * @desc Delete an alert
 */
const deleteAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    await AlertService.deleteAlert(alertId, userId);

    return res.status(200).json(
        new ApiResponse(200, null, 'Alert deleted successfully')
    );
});

/**
 * @route POST /api/v1/alerts/:alertId/deactivate
 * @desc Deactivate an alert
 */
const deactivateAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    const alert = await AlertService.deactivateAlert(alertId, userId);

    return res.status(200).json(
        new ApiResponse(200, alert, 'Alert deactivated successfully')
    );
});

export {
    createAlert,
    getUserAlerts,
    updateAlert,
    deleteAlert,
    deactivateAlert
};
