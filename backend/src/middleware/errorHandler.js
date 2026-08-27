/**
 * Central error handler. Maps thrown errors (with optional statusCode) to
 * HTTP responses. Always returns JSON and never leaks stack traces in prod.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err);
  }

  if (err.code) {
    // PostgreSQL error codes
    switch (err.code) {
      case "23505": // unique_violation
        return res.status(409).json({ error: "Resource already exists" });
      case "23503": // foreign_key_violation
        return res
          .status(400)
          .json({ error: "Referenced resource does not exist" });
      case "22P02": // invalid_text_representation (bad uuid/enum)
        return res.status(400).json({ error: "Invalid value provided" });
      case "23514": // check_violation
        return res.status(400).json({ error: "Value failed validation" });
      default:
        break;
    }
  }

  res
    .status(statusCode)
    .json({
      error:
        err.expose !== false && err.message
          ? err.message
          : "Internal server error",
    });
}

module.exports = { notFoundHandler, errorHandler };
