# Understanding the complete Jobs CRUD flow

CRUD means Create, Read, Update, Delete. This exercise covers JavaScript, Express, routing, application layers, validation, search, and errors. Data is stored in an in-memory array and resets when the server restarts.

## File flow

```text
Request -> app.js -> routes -> controller -> service -> repository -> jobs array
Response <- controller <- service <- repository <- jobs array
```

The service also calls validation functions. Results return from the repository through the service to the controller, which sends the JSON response.

| File | Responsibility |
| --- | --- |
| server.js | Start the server on a port |
| app.js | Parse JSON, connect routes, and handle unknown routes and errors |
| job.routes.js | Select a controller using the HTTP method and URL |
| job.controller.js | Read req, call the service, and respond using res |
| job.service.js | Validate input, check missing jobs, and apply search |
| job.repository.js | Find, create, update, and remove data |
| job.validation.js | Check IDs and required fields |
| data/jobs.js | Store sample records |

## Endpoints

| Method | URL | Action |
| --- | --- | --- |
| GET | /jobs | List all jobs |
| GET | /jobs?search=node | Search titles, companies, and locations |
| GET | /jobs/1 | Retrieve job 1 |
| POST | /jobs | Create a job |
| PUT | /jobs/1 | Update all three editable fields |
| DELETE | /jobs/1 | Remove a job |

POST and PUT require title, company, and location as non-empty strings. Send all three fields with PUT. The server assigns the ID.
200 means success, 201 created, 400 invalid input, and 404 job or route not found. A search with no matches returns an empty array.

## Parameters, query, and body

- `/jobs/2`: `req.params.id` contains the string `'2'`. `Number()` converts it to a number.
- `/jobs?search=intern`: `req.query.search` contains `'intern'`.
- POST/PUT JSON: `req.body` contains title, company, and location.

## Trace GET /jobs/1

1. app.js forwards the request to the `/jobs` router.
2. The `/:id` route calls the controller's getJob function.
3. The controller passes params.id to the service.
4. The service validates the ID and calls repository.findById.
5. The repository uses `find()` to retrieve the matching job.
6. If the job is missing, the service throws a 404 error. Express forwards it to the error middleware in app.js.
7. If the job exists, the controller sends it using res.json.

PUT first finds the job, validates the body, and then updates its fields with `Object.assign` in the repository.
DELETE first finds the job, then uses `findIndex` to locate its position and `splice` to remove it.
The ID counter is separate from the array length. Deleting a job does not cause its ID to be reused during the same server run.

## Run and practice

Run `npm.cmd start` in the first terminal. After editing code, press Ctrl+C and start it again. Run these commands in order in a second PowerShell terminal:

```powershell
Invoke-RestMethod 'http://localhost:3000/jobs'
Invoke-RestMethod 'http://localhost:3000/jobs?search=node'

$jobBody = @{
  title = 'Backend Intern'
  company = 'ABC Software'
  location = 'Karachi'
} | ConvertTo-Json

$createdJob = Invoke-RestMethod 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body $jobBody
$createdJob
$jobUrl = "http://localhost:3000/jobs/$($createdJob.id)"
Invoke-RestMethod $jobUrl

$updatedBody = @{
  title = 'Junior Backend Developer'
  company = 'ABC Software'
  location = 'Lahore'
} | ConvertTo-Json
Invoke-RestMethod $jobUrl -Method Put -ContentType 'application/json' -Body $updatedBody
Invoke-RestMethod $jobUrl

Invoke-RestMethod $jobUrl -Method Delete
Invoke-RestMethod 'http://localhost:3000/jobs'

# The record was deleted: expect a 404 response displayed as a PowerShell error.
Invoke-RestMethod $jobUrl
```

## Additional JavaScript concepts

| Code | Meaning |
| --- | --- |
| find | Return the first matching item |
| filter | Create an array of matching items |
| map | Create an array by transforming each item |
| ...data | Copy an object's fields |
| toLowerCase / includes | Convert to lowercase / check for matching text |
| Number.isSafeInteger | Check for an integer within JavaScript's safe range |
| Object.assign | Update an existing object's fields |
| findIndex / splice | Find a position / remove items |
| throw new Error | Stop the current operation by raising an error |

## Five-to-six-hour schedule

1. 45 minutes: learn objects, arrays, functions, and require/exports; write a sample job.
2. 45 minutes: run the server, change the welcome message, and trace the GET flow.
3. 60 minutes: study the layers, single-job retrieval, search, and params/query.
4. 60 minutes: practice POST and validation; try missing fields, numeric titles, and whitespace-only titles.
5. 60 minutes: practice PUT/DELETE; use GET after an update and confirm 404 after deletion.
6. 30–60 minutes: add a salary field, validate it as a positive number, and test POST/PUT.

If JavaScript is also new to you, allow more time. For each function, explain its input, work, and output in your own words.
