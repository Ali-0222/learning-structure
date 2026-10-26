const { readStore, updateStore } = require('../../data/job-store');
const { fail } = require('./job.validation');

async function findAll() {
  const store = await readStore();
  return store.jobs;
}

async function findById(id) {
  const jobs = await findAll();
  return jobs.find((job) => job.id === id);
}

async function create(data) {
  return updateStore((store) => {
    const job = { id: store.nextId, ...data };
    store.nextId = store.nextId + 1;
    store.jobs.push(job);
    return job;
  });
}

async function update(id, data) {
  return updateStore((store) => {
    const job = store.jobs.find((job) => job.id === id);
    // Another request may have deleted it after the service checked it.
    if (!job) fail(404, 'Job not found.');
    // PUT supplies all editable fields; PATCH supplies only changed fields.
    Object.assign(job, data);
    return job;
  });
}

async function remove(id) {
  return updateStore((store) => {
    const index = store.jobs.findIndex((job) => job.id === id);
    if (index === -1) fail(404, 'Job not found.');
    store.jobs.splice(index, 1);
  });
}

module.exports = { findAll, findById, create, update, remove };
