const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

/**
 * Every error leaves the API in the same shape:
 *   { error: { message: string, details?: { field: message } } }
 * Unexpected errors are logged but never leaked to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message;
  let details = err.details;

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON.';
  }
  // Mongoose schema validation (a safety net; controllers validate first)
  else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Please check the highlighted fields.';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }
  // Bad ObjectId in a query
  else if (err.name === 'CastError') {
    status = 404;
    message = 'Not found.';
  }
  // Duplicate key (e.g. email already used)
  else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use.';
  }

  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong on our side. Please try again.';
    details = undefined;
  }

  res.status(status).json({ error: { message, ...(details && { details }) } });
}

module.exports = { notFound, errorHandler, ApiError };
