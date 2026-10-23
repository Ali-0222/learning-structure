const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

test('Job lists filter, sort, paginate, and reject invalid query parameters', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hirehub-day-three-'));
  const file = path.join(directory, 'jobs.json');
  const jobs = [
    { id: 1, title: 'Zebra Developer', company: 'ABC', location: 'Lahore' },
    { id: 2, title: 'Alpha Developer', company: 'ABC', location: 'Karachi' },
    { id: 3, title: 'Beta Designer', company: 'XYZ', location: 'Karachi' },
    { id: 4, title: 'Alpha Developer', company: 'ABC', location: 'Karachi' },
    { id: 5, title: 'Delta Developer', company: 'XYZ', location: 'Lahore' },
    { id: 6, title: 'Gamma Intern', company: 'ABC', location: 'Karachi' },
  ];
  let server;
  t.after(async () => {
    if (server) await server.stop();
    await fs.rm(directory, { recursive: true, force: true });
  });
  await fs.writeFile(file, JSON.stringify({ nextId: 7, jobs }));
  const original = await fs.readFile(file, 'utf8');
  server = await startServer(file);

  const first = await server.request('/jobs');
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.data.map((job) => job.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(first.body.pagination, { page: 1, limit: 5, total: 6, totalPages: 2 });
  const second = await server.request('/jobs?page=2&limit=2&sortBy=title');
  assert.deepEqual(second.body.data.map((job) => job.id), [3, 5]);
  assert.deepEqual(second.body.pagination, { page: 2, limit: 2, total: 6, totalPages: 3 });
  const descending = await server.request('/jobs?sortBy=id&order=desc&limit=2');
  assert.deepEqual(descending.body.data.map((job) => job.id), [6, 5]);
  const tied = await server.request('/jobs?sortBy=title&limit=2');
  assert.deepEqual(tied.body.data.map((job) => job.id), [2, 4]);
  const filtered = await server.request('/jobs?search=developer&location=%20KARACHI%20&company=abc&limit=1&page=2');
  assert.deepEqual(filtered.body.data.map((job) => job.id), [4]);
  assert.equal(filtered.body.pagination.total, 2);
  assert.equal((await server.request('/jobs?location=kar')).body.pagination.total, 0);
  const empty = await server.request('/jobs?search=notfound');
  assert.deepEqual(empty.body.data, []);
  assert.equal(empty.body.pagination.totalPages, 0);
  const beyond = await server.request('/jobs?page=99');
  assert.deepEqual(beyond.body.data, []);
  assert.equal(beyond.body.pagination.total, 6);
  assert.equal((await server.request('/jobs?search=&location=&company=')).body.pagination.total, 6);
  assert.equal((await server.request('/jobs?limit=50')).body.data.length, 6);

  for (const query of [
    'page=0', 'page=-1', 'page=1.5', 'page=', 'page=1e2', 'page=1000001',
    'limit=0', 'limit=51', 'limit=abc', 'sortBy=salary', 'sortBy=', 'order=up',
    'page=1&page=2', 'search=a&search=b', 'location=a&location=b',
    'company=a&company=b', 'sortBy=id&sortBy=title', 'order=asc&order=desc',
    'location[x]=a', 'unknown=value',
  ]) {
    assert.equal((await server.request(`/jobs?${query}`)).status, 400, query);
  }
  assert.equal(await fs.readFile(file, 'utf8'), original, 'List requests must not change saved data');
  assert.equal((await server.request('/jobs/2')).body.title, 'Alpha Developer');
});

// Each test server runs in a separate process with a temporary data file.
async function startServer(file) {
  const child = spawn(process.execPath, ['-e', `
    const app = require('./src/app');
    const server = app.listen(0, '127.0.0.1', () => {
      process.send(server.address().port);
    });
  `], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, JOBS_FILE: file },
    stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
  });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Test server startup timed out.'));
    }, 10000);
    child.once('message', (value) => { clearTimeout(timer); resolve(value); });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Test server exited.')); });
  });
  return {
    async request(route, method = 'GET', body) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    },
    async stop() {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    },
  };
}

test('Jobs persist across restarts, validate input, and handle concurrent writes', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hirehub-day-two-'));
  const file = path.join(directory, 'jobs.json');
  let server;
  t.after(async () => {
    if (server) await server.stop();
    await fs.rm(directory, { recursive: true, force: true });
  });
  server = await startServer(file);
  assert.equal((await server.request('/jobs')).body.data.length, 1);
  const data = { title: ' Backend Intern ', company: 'ABC', location: 'Karachi' };
  const created = await server.request('/jobs', 'POST', data);
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Backend Intern');
  const id = created.body.id;
  await server.stop();
  server = await startServer(file);
  assert.equal((await server.request(`/jobs/${id}`)).body.title, 'Backend Intern');
  assert.equal((await server.request('/jobs?search=KARACHI')).body.data.length, 1);
  assert.equal((await server.request(`/jobs/${id}`, 'PUT', { ...data, location: 'Lahore' })).status, 200);
  assert.equal((await server.request(`/jobs/${id}`, 'PUT', {})).status, 400);
  assert.equal((await server.request(`/jobs/${id}`)).body.location, 'Lahore');
  const concurrent = await Promise.all(Array.from({ length: 5 }, () => server.request('/jobs', 'POST', data)));
  assert.ok(concurrent.every((result) => result.status === 201));
  assert.equal(new Set(concurrent.map((result) => result.body.id)).size, 5);
  assert.equal((await server.request('/jobs')).body.pagination.total, 7);
  assert.equal((await server.request(`/jobs/${id}`, 'DELETE')).status, 200);
  await server.stop();
  server = await startServer(file);
  assert.equal((await server.request(`/jobs/${id}`)).status, 404);
  assert.equal((await server.request('/jobs')).body.pagination.total, 6);
  const later = await server.request('/jobs', 'POST', data);
  assert.ok(later.body.id > Math.max(...concurrent.map((result) => result.body.id)));
  assert.equal((await server.request('/jobs/abc')).status, 400);
  assert.equal((await server.request('/unknown')).status, 404);

  // Corrupt data must produce an error rather than silently resetting jobs.
  const saved = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, '{broken');
  assert.equal((await server.request('/jobs')).status, 500);
  assert.equal((await server.request('/jobs', 'POST', data)).status, 500);
  assert.equal(await fs.readFile(file, 'utf8'), '{broken');
  await fs.writeFile(file, saved);

  // Simulate a failed write and verify the queue can recover afterwards.
  await fs.mkdir(`${file}.tmp`);
  assert.equal((await server.request('/jobs', 'POST', data)).status, 500);
  assert.equal(await fs.readFile(file, 'utf8'), saved);
  await fs.rmdir(`${file}.tmp`);
  assert.equal((await server.request('/jobs', 'POST', data)).status, 201);
});
