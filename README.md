# learning-structure
learning structure

# HireHub: pehla backend day

Backend woh program hai jo request leta hai, data par kaam karta hai aur response bhejta hai.
Node.js JavaScript ko browser ke bahar chalata hai. Express se URLs aur unka kaam define karte hain.
API woh interface hai jahan browser ya doosra program request bhej sakta hai.

## Pehle tumhare bare structure ko samjho

Woh poori application ka structure hai; aaj uska chhota jobs feature banaya hai.

| Folder/file | Kaam |
| --- | --- |
| prisma/ | Database ke models, changes aur sample records |
| src/server.ts | Server start karna |
| src/app.ts | Express, middleware aur routes jorna |
| src/config/ | Port, database aur doosri settings |
| src/modules/ | Features: auth, users, companies, jobs, applications waghera |
| src/middleware/ | Request ke darmiyan checks, jaise login aur validation |
| src/common/ | Kai features mein istemal hone wale helpers |
| src/integrations/ | Email, storage aur payment services se connection |
| src/jobs/ | Background kaam, jaise baad mein email bhejna |
| src/events/ | Kisi event par action, jaise user banne par welcome email |
| src/types/ | TypeScript ke shared type declarations |
| tests/ | Code ka behavior check karna |
| docs/ | Project samajhne ki documentation |
| scripts/ | Maintenance ke chhote programs |
| .env | Settings aur secrets; Git mein nahi daalte |
| package.json | Project ki packages aur run commands |
| package-lock.json | Installed packages ke exact versions ka record |
| tsconfig.json | TypeScript settings |
| ESLint / Prettier configs | Code checking aur formatting |
| Docker files | Application ko container mein chalane ki setup |

`modules/jobs` job vacancies ka feature hai. `src/jobs` background tasks hain: naam milte hain, kaam alag hai.
`.ts` TypeScript file hoti hai. Aaj `.js` yani JavaScript use ki hai taake setup chhota rahe.

Ek bare module mein files ka matlab:

- routes: kis URL aur method par kaunsa function chalega.
- controller: request ka data lena aur response bhejna.
- service: business rules, jaise kaun job publish kar sakta hai.
- repository: database se data lena aur save karna.
- validation: input sahi hai ya nahi.
- types: TypeScript mein data ki shape.
- constants: fixed values, jaise job statuses.

Aaj complete Jobs CRUD hai. Controller request/response, service rules, repository data aur validation input checks sambhalte hain. Naye endpoints aur practice ke liye [CRUD-GUIDE.md](CRUD-GUIDE.md) parho.

## Aaj ki files

```text
structure-understanding/
  package.json
  package-lock.json
  .gitignore
  README.md
  src/
    server.js                 server start
    app.js                    app setup aur routes connect
    data/
      jobs.js                 temporary jobs array
    modules/jobs/
      job.routes.js           GET/POST ka function select
      job.controller.js       request lena aur response bhejna
      job.service.js          checks aur kaam ka flow
      job.repository.js       array mein read/create/update/delete
      job.validation.js       fields aur ID check
```

`node_modules` npm banata hai; ismein Express aur uski dependencies hoti hain. Isko manually edit nahi karna.

## Run karo

Is folder ke PowerShell terminal mein:

```powershell
npm.cmd install
npm.cmd start
```

Terminal khula rakho. Browser mein http://localhost:3000 aur http://localhost:3000/jobs kholo.
Server band karne ke liye Ctrl+C. Code badalne ke baad Ctrl+C aur phir `npm.cmd start`.
`npm.cmd` Windows par npm chalata hai aur PowerShell execution-policy wale npm.ps1 issue se bachta hai.
Port 3000 busy ho to doosra chal raha server band karo ya server.js mein PORT badal do aur URLs mein bhi wahi number lagao.

## Nayi job bhejo

Browser address bar GET request bhejta hai. POST ke liye doosra PowerShell terminal kholo:

```powershell
$jobBody = @{
  title = 'Backend Intern'
  company = 'ABC Software'
  location = 'Karachi'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/jobs' -Method Post -ContentType 'application/json' -Body $jobBody

Invoke-RestMethod -Uri 'http://localhost:3000/jobs' -Method Get
```

POST ka response:

```json
{ "id": 2, "title": "Backend Intern", "company": "ABC Software", "location": "Karachi" }
```

Ab GET par dono jobs milengi. `company` hata kar POST karo to 400 error milega; PowerShell usay error ki tarah dikhayega.
Server restart karoge to sirf original sample job bachegi: array RAM mein hai, database mein nahi.

## Request code mein kaise chalti hai?

Startup: `npm start` -> `server.js` -> `app.js` load -> port 3000 par listen.

GET /jobs:

1. app.js ki middleware request se guzarti hai.
2. app.use('/jobs', jobRoutes) jobs router ko request deta hai.
3. router.get('/', getJobs) controller ka getJobs function chalata hai.
4. Controller service ko call karta hai; service repository se list leti aur search filter karti hai; controller JSON bhejta hai.

POST /jobs:

1. express.json() JSON body ko req.body banata hai.
2. Router createJob ko call karta hai.
3. Controller service ko body deta hai; service validation karwati hai.
4. Galat input par error throw hota hai; app.js ka error middleware 400 bhejta hai.
5. Sahi input par repository jobs.push(job) se array mein job add karti hai.
6. Controller res.status(201).json(...) se nayi job client ko bhejta hai.

## Code ke basic lafz

| Code | Matlab |
| --- | --- |
| const | Aisa variable jisko dobara assign nahi karte; array ke items phir bhi badal sakte hain |
| require(...) | Doosri file/package ki exported cheez lena |
| module.exports | Is file se doosri file ko cheez available karna |
| function | Naam wala reusable kaam |
| (req, res) => { ... } | Function likhne ka arrow syntax |
| req | Client se aayi request |
| req.body | Client ka bheja hua parsed data |
| res | Response bhejne ka object |
| [] | Array: cheezon ki list |
| {} | Yahan object: named fields wala data |
| const { title } = ... | Object se title field nikalna |
| typeof | Value ka type check karna |
| ! / \|\| | Nahi / ya |
| trim() | Text ke start/end ke spaces hatana |
| push() | Array mein item add karna |
| return | Function se bahar nikalna |

HTTP method action batata hai: GET data lena, POST naya data bhejna.
Status result batata hai: 200 success, 201 created, 400 galat input, 404 nahi mila.
JSON text format hai jo data exchange mein use hota hai; object ki tarah dikhta hai aur keys double quotes mein hoti hain.

## Shuru ki practice (complete CRUD schedule CRUD-GUIDE.md mein hai)

1. 1 ghanta: const, objects, arrays, functions aur require samjho; sample job khud likho.
2. 1 ghanta: server.js aur app.js parho, server chalao, welcome message badlo.
3. 1 ghanta: GET /jobs ka flow har file mein trace karo; array mein doosri sample job likho.
4. 1 ghanta: POST function parho aur PowerShell se job bhejo.
5. 1 ghanta: missing field, spaces-only title aur unknown URL try karo. Status codes samjho.
6. Optional 1 ghanta: notes dekhe baghair GET flow explain karo; job mein salary field add karne ki practice karo.

Aaj ka target: tum bata sako request kahan aati hai, function kaise select hota hai aur response kaise wapas jata hai.
