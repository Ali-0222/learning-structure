const service = require('./job.service');

// The controller reads request data and sends HTTP responses.
function getJobs(req, res) {
  res.json(service.listJobs(req.query.search));
}

function getJob(req, res) {
  res.json(service.getJob(req.params.id));
}

function createJob(req, res) {
  res.status(201).json(service.createJob(req.body));
}

function updateJob(req, res) {
  res.json(service.updateJob(req.params.id, req.body));
}

function deleteJob(req, res) {
  service.deleteJob(req.params.id);
  res.json({ message: 'Job deleted successfully.' });
}

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
