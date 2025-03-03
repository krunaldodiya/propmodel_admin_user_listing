/**
 * Response handler to standardize API responses
 */
export const responseHandler = (req, res, next) => {
  // Add success response helper
  res.success = (data = null, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  // Add error response helper
  res.error = (message = "Error", statusCode = 500, details = null) => {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        details: details ? [details].flat() : null,
      },
      timestamp: new Date().toISOString(),
    });
  };

  next();
};
