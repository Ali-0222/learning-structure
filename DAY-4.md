# Day 4: partial updates and request-body validation

## Today's goal

Update only the fields a client sends, understand PUT versus PATCH, and reject invalid changes before saving. The existing file storage and list features remain available. No new packages are required.

## PUT versus PATCH in this API

| Request | Required body | Result |
| --- | --- | --- |
| POST /jobs | title, company, location | Create a new job |
| PUT /jobs/:id | title, company, location | Replace all editable field values |
| PATCH /jobs/:id | At least one editable field | Update only the supplied fields |

The ID is assigned by the server and cannot be edited. POST, PUT, and PATCH now reject unknown fields with 400 rather than silently ignoring them. This catches spelling mistakes such as `locaton`.

Before:

```json
{ "id": 2, "title": "Backend Intern", "company": "ABC", "location": "Lahore" }
```

PATCH body:

```json
{ "location": "Karachi" }
```

After:

```json
{ "id": 2, "title": "Backend Intern", "company": "ABC", "location": "Karachi" }
```

Sending that same partial body with PUT produces 400 because PUT requires all three fields. Our PATCH format is a plain JSON object of editable fields, not a JSON Patch operations array.

## Read these files in order

1. [job.routes.js](src/modules/jobs/job.routes.js): `router.patch('/:id', patchJob)`.
2. [job.controller.js](src/modules/jobs/job.controller.js): pass ID/body to the service and await the result.
3. [job.validation.js](src/modules/jobs/job.validation.js): shared body checks and partial-field validation.
4. [job.service.js](src/modules/jobs/job.service.js): find the job, validate changes, call the repository.
5. [job.repository.js](src/modules/jobs/job.repository.js): apply changes to the latest stored record.
6. [jobs.test.js](tests/integration/jobs.test.js): test partial updates and unchanged data on failure.

## 1. Missing and invalid fields are different

For PATCH, an omitted field means leave it unchanged. A supplied invalid field means reject the request:

| Body | Outcome |
| --- | --- |
| `{"title":"Junior Developer"}` | Update title only |
| `{"title":"Junior Developer","location":"Karachi"}` | Update two fields |
| `{}` | 400: no changes supplied |
| `{"title":"   "}` | 400: empty text |
| `{"title":null}` | 400: must be a string |
| `{"id":99}` | 400: field is not editable |
| `{"locaton":"Karachi"}` | 400: unknown field |
| `{"title":"Valid","location":""}` | 400: entire request rejected, title also stays unchanged |
| `[]` | 400: body must be an object |

Values are trimmed before saving. A missing job returns 404; an invalid ID returns 400. The service checks ID and existence before field validation.

## 2. JavaScript concepts

```js
const fields = Object.keys(body);
const changes = {};
for (const field of fields) {
  const value = body[field];
  changes[field] = value.trim();
}
```

- `Object.keys` returns the names of an object's own fields.
- `for...of` visits each field name in the array.
- `body[field]` reads a property whose name is held in a variable.
- `changes[field]` writes that property to the new changes object.
- An allowlist limits input to title, company, and location.
- `Array.isArray` rejects arrays because JavaScript's `typeof []` is also `object`.

The real validator checks each value before assigning it. Nothing is saved until all supplied fields pass validation.

## 3. Reuse the existing repository update

```js
Object.assign(job, data);
```

This copies supplied fields into the existing record. PUT supplies all three editable fields; PATCH supplies only the changed fields. Reusing the repository avoids duplicating the storage code.

The service passes only the changes, rather than merging them with an older full record. Inside the Day 2 write queue, the repository loads the latest record and applies those changes. Two requests changing different fields can both survive. If requests change the same field, the later queued change wins.

## 4. Try it locally

Start the server in one terminal:

```powershell
npm.cmd start
```

Open a second PowerShell terminal:

```powershell
# Create a practice record and use the actual ID from its response.
$body = @{
  title = 'Backend Intern'
  company = 'ABC'
  location = 'Lahore'
} | ConvertTo-Json
$job = Invoke-RestMethod 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body $body
$jobUrl = "http://localhost:3000/jobs/$($job.id)"

# Change only location.
$changes = @{ location = 'Karachi' } | ConvertTo-Json
Invoke-RestMethod $jobUrl -Method Patch -ContentType 'application/json' -Body $changes
Invoke-RestMethod $jobUrl

# Change two fields together.
$changes = @{ title = 'Junior Developer'; company = 'XYZ' } | ConvertTo-Json
Invoke-RestMethod $jobUrl -Method Patch -ContentType 'application/json' -Body $changes

# This should fail with 400: PUT requires all three fields.
Invoke-RestMethod $jobUrl -Method Put -ContentType 'application/json' -Body $changes

# This should also fail: an empty update is not allowed.
Invoke-RestMethod $jobUrl -Method Patch -ContentType 'application/json' -Body '{}'
```

PowerShell displays non-success responses as errors. After an invalid request, GET the job again to confirm nothing changed. Stop and restart the server, then GET the same job to verify persistence. These examples create saved practice data.

## 5. Run tests

```powershell
npm.cmd test
```

Expect three passed tests and zero failures. The new test checks one-field updates, trimming, empty/invalid/unknown fields, PUT requirements, invalid IDs, missing jobs, simultaneous updates to different fields, and persistence after restarting. Tests use temporary files; your practice data stays separate.

The older storage-recovery test intentionally prints errors while testing failures. Check the final pass/fail summary.

## Five-to-six-hour practice plan

1. 45 minutes: review the request flow and compare POST, PUT, PATCH, and DELETE.
2. 60 minutes: trace one PATCH request through all layers.
3. 60 minutes: study Object.keys, for...of, bracket access, and Object.assign.
4. 60 minutes: try valid and invalid bodies; confirm failed requests leave data unchanged.
5. 45 minutes: study the new integration test and restart behavior.
6. 30–60 minutes: complete the exercise below and explain your code aloud.

Exercise: limit title to 100 characters, company to 80, and location to 80. Apply the same limits to POST, PUT, and PATCH. Test exact limits, over-limit values, and unchanged records after failed requests. This exercise is intentionally left for you.
