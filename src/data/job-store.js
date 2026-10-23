const fs = require('node:fs/promises');
const path = require('node:path');
const { jobsFile } = require('../config/storage');
const sampleJobs = require('./jobs');

async function readStore() {
  try {
    const text = await fs.readFile(jobsFile, 'utf8');
    const store = JSON.parse(text);
    if (!store || !Array.isArray(store.jobs) || !Number.isSafeInteger(store.nextId)
      || store.nextId < 1 || store.jobs.some((job) =>
        !job || !Number.isSafeInteger(job.id) || job.id < 1 || job.id >= store.nextId
        || typeof job.title !== 'string' || typeof job.company !== 'string'
        || typeof job.location !== 'string')
      || new Set(store.jobs.map((job) => job.id)).size !== store.jobs.length) {
      throw new Error('Saved jobs file has an invalid structure.');
    }
    return store;
  } catch (error) {
    // Only a missing file starts with sample data. Other errors must surface.
    if (error.code !== 'ENOENT') throw error;
    return {
      nextId: Math.max(0, ...sampleJobs.map((job) => job.id)) + 1,
      jobs: sampleJobs.map((job) => ({ ...job })),
    };
  }
}

// Serialize changes so two requests cannot overwrite each other's updates.
// This queue works within one Node process, not across multiple servers.
let pendingWrite = Promise.resolve();

function updateStore(change) {
  const operation = pendingWrite.then(async () => {
    const store = await readStore();
    const result = change(store);
    await fs.mkdir(path.dirname(jobsFile), { recursive: true });
    const temporaryFile = `${jobsFile}.tmp`;
    // Write a complete temporary file before replacing the saved data.
    await fs.writeFile(temporaryFile, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(temporaryFile, jobsFile);
    return result;
  });

  // A failed write must not block every later request.
  pendingWrite = operation.catch(() => {});
  return operation;
}

module.exports = { readStore, updateStore };
