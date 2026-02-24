import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware factory for validating request data with Zod schemas
 * @param {Object} schemas - Object containing schemas for body, query, params
 * @returns {Function} - Express middleware function
 */
const validate = (schemas) => {
    return async (req, res, next) => {
        try {
            // Validate request body
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }

            // Validate query parameters
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }

            // Validate route parameters
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                return next(new ApiError(400, 'Validation failed', errors));
            }
            next(error);
        }
    };
};

// Common validation schemas
const productSchemas = {
    scrapeProduct: z.object({
        url: z.string().url('Must be a valid URL')
    }),
    
    productId: z.object({
        productId: z.string().min(1, 'Product ID is required')
    }),
    
    getPriceHistory: z.object({
        days: z.string().optional().transform(val => val ? parseInt(val) : 30)
    })
};

const alertSchemas = {
    createAlert: z.object({
        productId: z.string().min(1, 'Product ID is required'),
        targetPrice: z.number().positive('Target price must be positive')
    }),
    
    updateAlert: z.object({
        targetPrice: z.number().positive('Target price must be positive').optional(),
        active: z.boolean().optional()
    }),
    
    alertId: z.object({
        alertId: z.string().min(1, 'Alert ID is required')
    })
};

export {
    validate,
    productSchemas,
    alertSchemas
};
