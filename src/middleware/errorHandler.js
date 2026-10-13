export const errorHandler = (err, req, res, next) => {
  console.error(`💥 [Server Error on ${req.method} ${req.url}]:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
