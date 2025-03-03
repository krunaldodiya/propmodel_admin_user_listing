/**
 * Create an error object with status code and translation key
 */
export const createError = (statusCode, message, translationKey = null) => ({
  statusCode,
  message,
  translationKey,
});

/**
 * Common error creators
 */
export const errors = {
  badRequest: (message, translationKey) =>
    createError(400, message, translationKey),
  unauthorized: (message, translationKey) =>
    createError(401, message, translationKey),
  forbidden: (message, translationKey) =>
    createError(403, message, translationKey),
  notFound: (message, translationKey) =>
    createError(404, message, translationKey),
  conflict: (message, translationKey) =>
    createError(409, message, translationKey),
  internal: (message, translationKey) =>
    createError(500, message, translationKey),
};

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.error(err.message, 400, err.errors);
  }

  // Handle database errors
  if (err.code === "23505") {
    // Unique violation
    return res.error(req.t("errors.database_error"), 409);
  }

  // Handle other database errors
  if (err.code && err.code.startsWith("2")) {
    return res.error(req.t("errors.database_error"), 500);
  }

  // Handle other errors
  return res.error(req.t("errors.internal_server_error"), 500);
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res) => {
  res.error(
    req.t("errors.route_not_found", {
      method: req.method,
      url: req.url,
    }),
    404
  );
};
