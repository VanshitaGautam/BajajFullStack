const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error(`[Error] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    is_success: false,
    message: err.message || 'Internal Server Error',
    // Only return stack trace in non-production environments
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
