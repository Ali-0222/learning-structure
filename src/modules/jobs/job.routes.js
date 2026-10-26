const express = require('express');
const { getJobs, getJob, createJob, updateJob, patchJob, deleteJob } = require('./job.controller');
const router = express.Router();

// app.js adds the /jobs prefix, so this route only needs /.
router.get('/', getJobs);
router.post('/', createJob);
// :id is a route parameter: /jobs/1 gives an id of '1'.
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.patch('/:id', patchJob);
router.delete('/:id', deleteJob);

module.exports = router;
