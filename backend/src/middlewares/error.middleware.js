/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Prisma errors
    if (err.code) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                message = `Duplicate field value: ${err.meta?.target}`;
                break;
            case 'P2025':
                statusCode = 404;
                message = 'Record not found';
                break;
            case 'P2003':
                statusCode = 400;
                message = 'Invalid foreign key constraint';
                break;
            default:
                message = 'Database error occurred';
        }
    }

    // Log error for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

export { errorHandler };
