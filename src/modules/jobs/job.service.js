const repository = require('./job.repository');
const { fail, validateId, validateJob } = require('./job.validation');

// The service handles application rules without using req or res.
async function listJobs(search = '') {
  if (typeof search !== 'string') {
    fail(400, 'Search must be a single text value.');
  }
  const keyword = search.trim().toLowerCase();
  const jobs = await repository.findAll();
  return jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    return text.includes(keyword);
  });
}

async function getJob(rawId) {
  const id = validateId(rawId);
  const job = await repository.findById(id);
  if (!job) {
    fail(404, 'Job not found.');
  }
  return job;
}

async function createJob(body) {
  return repository.create(validateJob(body));
}

async function updateJob(rawId, body) {
  const job = await getJob(rawId); // Wait for the saved record to load.
  const data = validateJob(body); // PUT requires all three editable fields.
  return repository.update(job.id, data);
}

async function deleteJob(rawId) {
  const job = await getJob(rawId);
  await repository.remove(job.id);
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
