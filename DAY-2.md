# Day 2: persistent data, async/await, and middleware

## Today's outcome

Jobs now survive a server restart. The API saves changes in `data/jobs.json`, a local file created after the first successful create, update, or delete operation. The endpoints and request fields remain the same.

This is a single-process learning application. A JSON file is useful for understanding storage before learning a database; it does not provide a database's multi-server coordination or query features. Run only one application process against the same file.

## Run and verify

```powershell
npm.cmd start
```

Use a second terminal to create a job:

```powershell
$body = @{
  title = 'Day Two Intern'
  company = 'Learning Company'
  location = 'Karachi'
} | ConvertTo-Json
$job = Invoke-RestMethod 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body $body
$job
```

Stop the server with Ctrl+C, then run `npm.cmd start` again. Keep the second terminal open and run:

```powershell
Invoke-RestMethod "http://localhost:3000/jobs/$($job.id)"
```

The saved job should still exist. Inspect `data/jobs.json` to see the record and the next ID. Update or delete a job using the commands in [CRUD-GUIDE.md](CRUD-GUIDE.md), restart, and check that the change also persists.

## Read files in this order

1. [app.js](src/app.js): middleware order and route registration.
2. [request-logger.middleware.js](src/middleware/request-logger.middleware.js): `next()`.
3. [job.controller.js](src/modules/jobs/job.controller.js): waiting for a result before responding.
4. [job.service.js](src/modules/jobs/job.service.js): waiting before checking or filtering data.
5. [job.repository.js](src/modules/jobs/job.repository.js): the same CRUD actions with stored data.
6. [storage.js](src/config/storage.js): choosing the file path.
7. [job-store.js](src/data/job-store.js): reading, parsing, and saving JSON.
8. [error.middleware.js](src/middleware/error.middleware.js): one place for error responses.

## 1. Middleware and next()

A middleware function runs during request processing. The logger prints the request method and path, such as `GET /jobs`, then calls `next()` to continue.

```js
function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.path}`);
  next();
}
```

If middleware neither sends a response nor calls `next()`, the request keeps waiting.

The order in app.js is:

```text
request logger -> JSON parser -> routes -> unknown-route handler -> error handler
```

The unknown-route handler runs only when earlier handlers have not handled the request. Errors skip normal handlers and reach the four-parameter error middleware. The project uses Express 5, which forwards rejected async route handlers to error middleware.

## 2. Promises, async, and await

Reading a file takes time. An asynchronous operation returns a Promise: a value representing a future result or failure.

```js
async function getJobs(req, res) {
  const jobs = await service.listJobs(req.query.search);
  res.json(jobs);
}
```

- `async` makes the function return a Promise.
- `await` waits inside that function for the Promise's result.
- Node can handle other work while file I/O is pending.
- A rejected Promise throws at the await expression and reaches the error handler.

Without await, `jobs` would be a Promise rather than the list you want to send. The service also awaits the repository before calling array methods such as `filter`.

## 3. Reading and writing JSON

`node:fs/promises` is built into Node; it does not need an npm install.

```js
const text = await fs.readFile(jobsFile, 'utf8');
const store = JSON.parse(text);
```

`readFile` reads text. `JSON.parse` converts JSON text into JavaScript data. `JSON.stringify(store, null, 2)` converts data back into text with two-space indentation.

The file contains this shape:

```json
{
  "nextId": 2,
  "jobs": [
    { "id": 1, "title": "Junior Node.js Developer", "company": "HireHub", "location": "Lahore" }
  ]
}
```

The counter is saved too, so deleting a record and restarting does not reuse its ID. `src/data/jobs.js` now provides starter records only when the saved file is missing. Editing that sample array does not change an existing saved file.

`ENOENT` means the file is missing. Only that condition uses sample data. Invalid JSON, invalid saved structure, and permission errors produce a 500 response instead of overwriting your saved records.

## 4. Follow a POST request

1. The logger prints `POST /jobs` and calls next.
2. Express parses the JSON body.
3. The router calls the async controller.
4. The service validates the input.
5. The repository asks updateStore to create a record.
6. The store reads existing data, adds the record, and updates nextId.
7. It writes a temporary file and renames it to the final filename.
8. The controller sends 201 only after saving succeeds.

## 5. Read the write queue last

Two simultaneous requests could otherwise read the same old file and overwrite each other's changes. `pendingWrite` chains each modification after the previous one. Each operation reads the latest data when its turn starts.

The temporary file avoids replacing good saved data with a partially written JSON document. Failed operations return an error; the queue catches the failure separately so later requests can still run. This is extra reliability code: understand the basic read/write flow before studying the Promise chain.

## Tests

```powershell
npm.cmd test
```

The integration test starts temporary server processes, creates a record, restarts the server, and confirms persistence. It also checks updates, deletion, search, validation, concurrent creates, ID progression, corrupted data, and recovery after a failed write. It uses a temporary folder and does not modify your practice data.

The existing `.ts` test files remain placeholders. The new `.js` test uses Node's built-in test runner.

## Five-to-six-hour practice plan

1. 45 minutes: review yesterday's GET and POST request flow.
2. 45 minutes: study middleware order and watch request logs.
3. 60 minutes: learn async/await and trace the controller/service calls.
4. 60 minutes: create, update, and delete records; restart after each action.
5. 45 minutes: read the JSON storage helper and error handling.
6. 45–60 minutes: run tests, read the write queue, and explain the flow without notes.

Practice exercise: add an `employmentType` field with allowed values `full-time`, `part-time`, and `internship`. Update validation, sample data, and saved-data checks together. Test both valid and invalid values. This exercise is intentionally left for you.

Local saved data is ignored by Git. To start fresh, stop the server and rename your saved JSON file as a backup; the next run will use sample data. No commit or push is required to complete this lesson.
