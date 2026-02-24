/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} requestHandler - The async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
