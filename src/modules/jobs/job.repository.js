const jobs = require('../../data/jobs');

// Keep increasing the counter so deleted IDs are not reused during this run.
let nextId = Math.max(0, ...jobs.map((job) => job.id)) + 1;

function findAll() {
  return jobs;
}

function findById(id) {
  return jobs.find((job) => job.id === id);
}

function create(data) {
  const job = { id: nextId, ...data };
  nextId = nextId + 1;
  jobs.push(job);
  return job;
}

function update(id, data) {
  const job = findById(id);
  Object.assign(job, data); // Update the fields of the existing object.
  return job;
}

function remove(id) {
  const index = jobs.findIndex((job) => job.id === id);
  if (index !== -1) {
    jobs.splice(index, 1); // Remove one item at this position.
  }
}

module.exports = { findAll, findById, create, update, remove };
