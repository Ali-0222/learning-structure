// Keep all four parameters: Express uses them to identify error middleware.
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (!err.status) console.error(err.message);
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Unable to process the request.',
  });
}

module.exports = errorHandler;
