const service = require('./job.service');

// The controller reads request data and sends HTTP responses.
async function getJobs(req, res) {
  const jobs = await service.listJobs(req.query.search);
  res.json(jobs);
}

async function getJob(req, res) {
  const job = await service.getJob(req.params.id);
  res.json(job);
}

async function createJob(req, res) {
  const job = await service.createJob(req.body);
  res.status(201).json(job);
}

async function updateJob(req, res) {
  const job = await service.updateJob(req.params.id, req.body);
  res.json(job);
}

async function deleteJob(req, res) {
  await service.deleteJob(req.params.id);
  res.json({ message: 'Job deleted successfully.' });
}

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
