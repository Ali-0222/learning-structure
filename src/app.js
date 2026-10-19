const express = require('express');
const jobRoutes = require('./modules/jobs/job.routes');

const app = express();

// JSON body ko JavaScript data banata hai, jo req.body mein milega.
app.use(express.json());

// req = aane wali request; res = wapas bhejne wala response.
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HireHub API!' });
});

// /jobs se shuru hone wali requests jobs router ko milengi.
app.use('/jobs', jobRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error middleware ke chaar parameters Express ko iska role batate hain.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Unable to process the request.',
  });
});

module.exports = app;
