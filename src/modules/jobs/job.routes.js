const express = require('express');
const { getJobs, getJob, createJob, updateJob, deleteJob } = require('./job.controller');
const router = express.Router();

// app.js ne /jobs prefix lagaya hai, is liye yahan sirf / hai.
router.get('/', getJobs);
router.post('/', createJob);
// :id variable hissa hai: /jobs/1 mein id '1' hogi.
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
