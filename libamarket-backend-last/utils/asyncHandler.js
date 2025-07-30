// Utility function to wrap async route handlers
// Catches errors and passes them to the next() middleware (our error handler)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

