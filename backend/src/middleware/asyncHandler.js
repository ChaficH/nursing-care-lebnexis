/**
 * Async wrapper - forwards any rejected promise to Express error handler,
 * avoiding try/catch boilerplate in every controller.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
