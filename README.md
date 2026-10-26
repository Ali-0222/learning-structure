# learning-structure

A beginner-friendly project for learning Node.js backend structure through a working HireHub Jobs API.

**Day 4:** Read [DAY-4.md](DAY-4.md) for partial updates with PATCH, PUT versus PATCH, and strict request-body validation. POST/PUT/PATCH now reject unknown fields instead of ignoring them.

**Day 2:** Start with [DAY-2.md](DAY-2.md) for JSON file persistence, async/await, middleware, and restart tests. Jobs now survive server restarts.

**Day 3:** Read [DAY-3.md](DAY-3.md) for query validation, filtering, sorting, and pagination. `GET /jobs` now returns `{ data, pagination }`, with five jobs per page by default. Other endpoint response shapes are unchanged.

A backend receives requests, works with data, and sends responses. Node.js runs JavaScript outside the browser. Express helps define URLs and the functions that handle them. An API lets a browser or another program request data or perform actions.

## Understanding the full structure

The complete planned structure is included for learning. The `.js` files implement the running Jobs API. The `.ts` files and unused configuration files are empty placeholders; their features and tools are not configured yet. See [architecture.md](docs/architecture.md) for the full file list.

| Folder/file | Purpose |
| --- | --- |
| prisma/ | Database models, migrations, and sample records |
| src/server.ts | Planned TypeScript server entry point |
| src/app.ts | Planned TypeScript application setup |
| src/config/ | Port, database, and other service settings |
| src/modules/ | Features such as authentication, users, companies, jobs, and applications |
| src/middleware/ | Request checks such as authentication and validation |
| src/common/ | Helpers shared across features |
| src/integrations/ | Connections to email, storage, and payment services |
| src/jobs/ | Background tasks such as queued emails |
| src/events/ | Actions triggered by events, such as sending a welcome email after registration |
| src/types/ | Global TypeScript declarations |
| tests/ | Application behavior checks |
| docs/ | Project documentation |
| scripts/ | Maintenance programs |
| .env | Settings and secrets; excluded from Git |
| package.json | Project dependencies and commands |
| package-lock.json | Exact dependency versions |
| tsconfig.json | TypeScript settings |
| ESLint / Prettier configs | Code checking and formatting settings |
| Docker files | Container setup |

`src/modules/jobs` represents job vacancies. `src/jobs` is for background tasks. Their similar names describe different responsibilities.

Files inside a feature module have these roles:

- **Routes:** choose a function based on the URL and HTTP method.
- **Controller:** read request data and send HTTP responses.
- **Service:** apply application rules, such as checking whether a job exists.
- **Repository:** read and write records through the JSON file storage helper.
- **Validation:** check input values.
- **Types:** describe data shapes in TypeScript.
- **Constants:** store fixed values such as job statuses.

The working Jobs API supports create, read, update, delete, search, and input validation. See [CRUD-GUIDE.md](CRUD-GUIDE.md) for all endpoints and exercises.

## Working files

```text
structure-understanding/
  package.json
  package-lock.json
  .gitignore
  README.md
  src/
    server.js                 starts the server
    app.js                    sets up Express and connects routes
    data/
      jobs.js                 provides starter records when no saved file exists
      job-store.js            reads and saves JSON data
    config/
      storage.js              selects the storage file path
    middleware/
      request-logger.middleware.js  logs requests and calls next()
      not-found.middleware.js       handles unknown routes
      error.middleware.js           sends error responses
    modules/jobs/
      job.routes.js           maps methods and URLs to controllers
      job.controller.js       reads requests and sends responses
      job.service.js          handles rules and application flow
      job.repository.js       reads and modifies saved jobs
      job.validation.js       checks fields and IDs
```

npm creates `node_modules` to store Express and its dependencies. Do not edit these files manually.

## Run the application

Open PowerShell in the project folder:

```powershell
npm.cmd install
npm.cmd start
```

Keep the terminal open. Visit http://localhost:3000 or http://localhost:3000/jobs in your browser.
Press Ctrl+C to stop the server. After changing code, stop it and run `npm.cmd start` again.
On Windows, `npm.cmd` avoids PowerShell execution-policy issues with `npm.ps1`.
If port 3000 is busy, stop the other server or change `PORT` in `server.js` and use the same port in your URLs.

## Create a job

The browser address bar sends a GET request. To send POST, open a second PowerShell terminal:

```powershell
$jobBody = @{
  title = 'Backend Intern'
  company = 'ABC Software'
  location = 'Karachi'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body $jobBody

Invoke-RestMethod -Uri 'http://localhost:3000/jobs' -Method Get
```

Example POST response when creating the first new job with no previous saved data:

```json
{ "id": 2, "title": "Backend Intern", "company": "ABC Software", "location": "Karachi" }
```

With just these two records, GET returns both jobs inside `data`, alongside pagination information. Remove `company` from the POST body to receive a 400 response; PowerShell displays it as an error.
Jobs are saved in `data/jobs.json` and survive a restart. `src/data/jobs.js` supplies starter data only when the saved file is missing. The saved file is excluded from Git. This is local file storage, not a database.

## How a request moves through the code

Startup: `npm start` -> `server.js` -> load `app.js` -> listen on port 3000.

GET /jobs:

1. The request passes through the middleware in app.js.
2. `app.use('/jobs', jobRoutes)` forwards it to the jobs router.
3. `router.get('/', getJobs)` calls the controller's getJobs function.
4. The controller passes the full query object to the service. The service validates it, loads the records, filters and sorts them, then selects the requested page. The controller sends `{ data, pagination }` as JSON.

POST /jobs:

1. `express.json()` parses the JSON request body into `req.body`.
2. The router calls createJob.
3. The controller passes the body to the service, which validates it.
4. Invalid input throws an error; the error middleware registered in app.js sends a 400 response.
5. For valid input, the repository adds a record through the storage helper and waits for the JSON file to be saved.
6. The async controller sends the new job with status 201 after saving succeeds.

## Basic code vocabulary

| Code | Meaning |
| --- | --- |
| const | A variable that cannot be reassigned; array contents can still change |
| require(...) | Import a file's or package's exported value |
| module.exports | Make a value available to other files |
| function | A reusable block of code |
| (req, res) => { ... } | Arrow function syntax |
| req | The incoming request |
| req.body | Parsed data sent by the client |
| res | The object used to send a response |
| [] | An array: a list of items |
| {} | In this data example, an object with named fields |
| const { title } = ... | Extract the title field from an object |
| typeof | Check a value's type |
| ! / \|\| | Logical NOT / OR |
| trim() | Remove whitespace from both ends of a string |
| push() | Add an item to an array |
| return | Exit a function, optionally returning a value |

HTTP methods describe actions: GET retrieves data, POST submits new data. Status codes describe results: 200 success, 201 created, 400 invalid input, 404 not found.
JSON is a text format for exchanging data. It resembles JavaScript objects but requires double-quoted keys.

## Introductory practice

The complete CRUD schedule is in [CRUD-GUIDE.md](CRUD-GUIDE.md).

1. Spend an hour on variables, objects, arrays, functions, and require. Write a sample job yourself.
2. Read server.js and app.js, run the server, and change the welcome message.
3. Trace GET /jobs through each file. Add another job using POST and inspect the saved JSON file.
4. Read the POST flow and send a job from PowerShell.
5. Try missing fields, a whitespace-only title, and an unknown URL. Observe the status codes.
6. Explain the GET flow without notes and practice adding a salary field.

The goal is to explain where a request enters, how its handler is selected, and how the response returns.
