import { Router } from 'express';
import {
    createAlert,
    getUserAlerts,
    updateAlert,
    deleteAlert,
    deactivateAlert
} from '../controllers/alert.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate, alertSchemas } from '../middlewares/validation.middleware.js';

const router = Router();

// All alert routes require authentication
router.use(verifyJWT);

/**
 * @route POST /api/v1/alerts
 * @desc Create a new price alert
 * @access Private
 */
router.post(
    '/',
    validate({ body: alertSchemas.createAlert }),
    createAlert
);

/**
 * @route GET /api/v1/alerts
 * @desc Get all alerts for authenticated user
 * @access Private
 */
router.get('/', getUserAlerts);

/**
 * @route PATCH /api/v1/alerts/:alertId
 * @desc Update an alert
 * @access Private
 */
router.patch(
    '/:alertId',
    validate({
        params: alertSchemas.alertId,
        body: alertSchemas.updateAlert
    }),
    updateAlert
);

/**
 * @route DELETE /api/v1/alerts/:alertId
 * @desc Delete an alert
 * @access Private
 */
router.delete(
    '/:alertId',
    validate({ params: alertSchemas.alertId }),
    deleteAlert
);

/**
 * @route POST /api/v1/alerts/:alertId/deactivate
 * @desc Deactivate an alert
 * @access Private
 */
router.post(
    '/:alertId/deactivate',
    validate({ params: alertSchemas.alertId }),
    deactivateAlert
);

export default router;
