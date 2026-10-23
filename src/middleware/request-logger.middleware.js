function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.path}`);
  // Continue to the next middleware or route handler.
  next();
}

module.exports = requestLogger;
