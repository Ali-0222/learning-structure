const express = require('express');
const jobRoutes = require('./modules/jobs/job.routes');

const app = express();

// Parse a JSON request body into JavaScript data available in req.body.
app.use(express.json());

// req is the incoming request; res is used to send the response.
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HireHub API!' });
});

// Forward requests starting with /jobs to the jobs router.
app.use('/jobs', jobRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Express identifies error middleware by its four parameters.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Unable to process the request.',
  });
});

module.exports = app;
