const path = require('node:path');

// Tests can use a temporary file without changing your practice data.
const jobsFile = process.env.JOBS_FILE
  ? path.resolve(process.env.JOBS_FILE)
  : path.join(__dirname, '../../data/jobs.json');

module.exports = { jobsFile };
