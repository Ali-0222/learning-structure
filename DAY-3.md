# Day 3: filtering, sorting, and pagination

Today's goal is to understand how a list endpoint uses query parameters. The existing CRUD API and JSON storage are still in place. No new packages are needed.

## What changed?

`GET /jobs` now returns an object containing records and pagination information, rather than a plain array:

```json
{
  "data": [
    { "id": 1, "title": "Junior Node.js Developer", "company": "HireHub", "location": "Lahore" }
  ],
  "pagination": { "page": 1, "limit": 5, "total": 1, "totalPages": 1 }
}
```

This example assumes only the original sample record exists. Your saved records determine the actual values. Single-job, create, update, and delete responses keep their previous formats.

## Read the code in this order

1. [job.controller.js](src/modules/jobs/job.controller.js): passes all of `req.query` to the service.
2. [job-query.validation.js](src/modules/jobs/job-query.validation.js): converts and validates query values.
3. [job.service.js](src/modules/jobs/job.service.js): filters and sorts the records.
4. [pagination.js](src/common/utils/pagination.js): selects a page and creates metadata.
5. [jobs.test.js](tests/integration/jobs.test.js): verifies query behavior with known records.

## 1. Understanding a query string

```text
/jobs?location=Karachi&page=2&limit=3
```

The `?` starts the query string and `&` separates parameters. Express puts their values in `req.query`:

```js
{ location: 'Karachi', page: '2', limit: '3' }
```

Numbers arrive as strings. Validation converts page and limit into numbers before calculation. Repeated query parameters can become arrays, so the validator checks the type too.

| Parameter | Default | Meaning |
| --- | --- | --- |
| search | Empty | Case-insensitive partial match across title, company, and location |
| location | Empty | Case-insensitive exact location match |
| company | Empty | Case-insensitive exact company match |
| page | 1 | Positive whole number, maximum 1,000,000 |
| limit | 5 | Records per page, from 1 to 50 |
| sortBy | id | One of id, title, company, location |
| order | asc | asc or desc |

Filters can be combined: every condition must match. Text filters are trimmed and normalized to lowercase. Empty search/location/company means no restriction. Unknown parameters, repeated parameters, and invalid numeric or sorting values return 400. Parameter names and sort options are case-sensitive.

## 2. Filter before pagination

The service uses `filter()` to make a new list of matching jobs:

```js
return text.includes(search)
  && (!location || job.location.toLowerCase() === location)
  && (!company || job.company.toLowerCase() === company);
```

- `includes` checks for a partial text match.
- `===` checks an exact location or company match after lowercasing.
- `&&` means all conditions must be true.
- `!location || ...` means skip this check when no location was supplied.

Filtering first ensures `pagination.total` counts all matching jobs, not just the current page.

## 3. Sort before selecting the page

`sort()` compares two records at a time. A negative result places the first record earlier; a positive result places it later.

- IDs use subtraction for numeric ordering.
- Text fields use `localeCompare` with case-insensitive English comparison.
- Equal values are ordered by ID so page order is predictable.
- Descending order reverses the comparison, including the ID tie-breaker.

The service sorts the new array returned by filter. It does not write anything to the saved JSON file.

## 4. Calculate a page

```js
const start = (page - 1) * limit;
const data = items.slice(start, start + limit);
const totalPages = Math.ceil(items.length / limit);
```

For page 2 with limit 3, start is 3. `slice(3, 6)` selects indexes 3, 4, and 5: the fourth, fifth, and sixth records. The end index is excluded.

For seven matching records and limit 3, `Math.ceil(7 / 3)` gives three pages. A page beyond the end returns an empty data array with the real totals. No matches means total and totalPages are both zero.

## 5. Run and try it

```powershell
npm.cmd start
```

In a second PowerShell terminal, add practice records through the API:

```powershell
$practiceJobs = @(
  @{ title = 'Backend Intern'; company = 'ABC'; location = 'Karachi' },
  @{ title = 'Frontend Developer'; company = 'XYZ'; location = 'Lahore' },
  @{ title = 'Node Developer'; company = 'ABC'; location = 'Karachi' },
  @{ title = 'QA Intern'; company = 'ABC'; location = 'Islamabad' }
)
foreach ($job in $practiceJobs) {
  Invoke-RestMethod 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body ($job | ConvertTo-Json)
}
```

These commands create real saved records. Running them again adds more records.

Try these browser URLs:

- http://localhost:3000/jobs?page=1&limit=2
- http://localhost:3000/jobs?page=2&limit=2
- http://localhost:3000/jobs?location=Karachi&company=ABC
- http://localhost:3000/jobs?search=intern&sortBy=title&order=asc
- http://localhost:3000/jobs?sortBy=id&order=desc&limit=2
- http://localhost:3000/jobs?page=0 (expect 400)
- http://localhost:3000/jobs?limit=51 (expect 400)

In PowerShell, quote URLs containing `&`:

```powershell
$result = Invoke-RestMethod 'http://localhost:3000/jobs?location=Karachi&page=1&limit=2'
$result.data | Format-Table
$result.pagination
```

## 6. Run tests

```powershell
npm.cmd test
```

The Day 2 test covers persistence and CRUD. The Day 3 test checks page boundaries, combined filters, ascending/descending sorting, equal-title ordering, invalid queries, empty results, and unchanged saved data after reads. Day 4 adds a partial-update test. All use temporary storage rather than your practice records.

The Day 2 failure-recovery checks intentionally print storage errors. With Day 4 included, the final test summary should show three passed and zero failed tests.

## Five-to-six-hour learning plan

1. 45 minutes: review the controller/service/repository flow and req.query.
2. 60 minutes: read query validation and try invalid inputs.
3. 60 minutes: practice search and combined exact filters.
4. 45 minutes: study numeric/text sorting and try both directions.
5. 60 minutes: calculate page indexes by hand and compare API results.
6. 30–60 minutes: read tests and complete the exercise below.

Exercise: add `hasNextPage` and `hasPreviousPage` to the pagination metadata. Decide what they should mean for zero results and out-of-range pages, then add tests for those cases. This exercise is left for you to implement.

This application still loads all jobs from a local JSON file before filtering. It is a learning step toward doing these operations in database queries later. All lesson code, comments, and documentation are in English.
