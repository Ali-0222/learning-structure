const repository = require('./job.repository');
const { fail, validateId, validateJob } = require('./job.validation');

// The service handles application rules without using req or res.
function listJobs(search = '') {
  if (typeof search !== 'string') {
    fail(400, 'Search must be a single text value.');
  }
  const keyword = search.trim().toLowerCase();
  return repository.findAll().filter((job) => {
    const text = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    return text.includes(keyword);
  });
}

function getJob(rawId) {
  const id = validateId(rawId);
  const job = repository.findById(id);
  if (!job) {
    fail(404, 'Job not found.');
  }
  return job;
}

function createJob(body) {
  return repository.create(validateJob(body));
}

function updateJob(rawId, body) {
  const job = getJob(rawId); // The record must exist before it can be updated.
  const data = validateJob(body); // PUT requires all three editable fields.
  return repository.update(job.id, data);
}

function deleteJob(rawId) {
  const job = getJob(rawId);
  repository.remove(job.id);
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
