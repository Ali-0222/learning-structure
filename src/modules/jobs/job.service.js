const repository = require('./job.repository');
const { fail, validateId, validateJob } = require('./job.validation');

// Service kaam ke rules sambhalti hai; yahan req/res nahi hain.
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
  const job = getJob(rawId); // Update se pehle record hona zaroori hai.
  const data = validateJob(body); // PUT mein teenon fields chahiye.
  return repository.update(job.id, data);
}

function deleteJob(rawId) {
  const job = getJob(rawId);
  repository.remove(job.id);
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
