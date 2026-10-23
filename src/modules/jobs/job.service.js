const repository = require('./job.repository');
const { fail, validateId, validateJob } = require('./job.validation');
const { validateJobQuery } = require('./job-query.validation');
const { paginate } = require('../../common/utils/pagination');

// The service handles application rules without using req or res.
async function listJobs(query = {}) {
  const { search, location, company, page, limit, sortBy, order } = validateJobQuery(query);
  const jobs = await repository.findAll();
  const filtered = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    return text.includes(search)
      && (!location || job.location.toLowerCase() === location)
      && (!company || job.company.toLowerCase() === company);
  });

  // filter creates a new array, so sorting it does not change stored records.
  filtered.sort((a, b) => {
    const comparison = sortBy === 'id'
      ? a.id - b.id
      : a[sortBy].localeCompare(b[sortBy], 'en', { sensitivity: 'base' });
    // Equal values use ID as a stable tie-breaker between pages.
    const result = comparison || a.id - b.id;
    return order === 'desc' ? -result : result;
  });

  // Filter first, sort second, and select the page last.
  return paginate(filtered, page, limit);
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
