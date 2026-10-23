const express = require('express');
const jobRoutes = require('./modules/jobs/job.routes');
const requestLogger = require('./middleware/request-logger.middleware');
const notFound = require('./middleware/not-found.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();
app.use(requestLogger);

// Parse a JSON request body into JavaScript data available in req.body.
app.use(express.json());

// req is the incoming request; res is used to send the response.
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HireHub API!' });
});

// Forward requests starting with /jobs to the jobs router.
app.use('/jobs', jobRoutes);

// Order matters: routes first, unknown-route handling next, errors last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
