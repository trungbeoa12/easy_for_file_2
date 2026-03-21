function notFoundHandler(req, res) {
  if (!req.path.startsWith('/api')) {
    return res.status(404).send('Not found');
  }

  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    errors: null,
  });
}

module.exports = notFoundHandler;
