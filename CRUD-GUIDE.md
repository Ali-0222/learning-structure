# Ab complete Jobs CRUD samjho

CRUD = Create, Read, Update, Delete. Is exercise mein JavaScript, Express, routing, layers, validation, search aur errors seekhoge. Data RAM ke array mein hai; restart par reset hoga.

## Files ka flow

```text
Request -> app.js -> routes -> controller -> service -> repository -> jobs array
                                  |
                               Response
```

Service validation file ko bhi call karti hai. Result repository se service aur phir controller ko wapas milta hai. Controller JSON response bhejta hai.

| File | Zimmedari |
| --- | --- |
| server.js | Port par server start |
| app.js | JSON parsing, router connect, unknown routes aur errors |
| job.routes.js | Method aur URL dekh kar controller select |
| job.controller.js | req se data lena, service call, res se response |
| job.service.js | Input check karwana, missing job ka rule, search |
| job.repository.js | Data find, create, update aur remove |
| job.validation.js | Valid ID aur required fields check |
| data/jobs.js | Sample records |

## Endpoints

| Method | URL | Kaam |
| --- | --- | --- |
| GET | /jobs | Sab jobs |
| GET | /jobs?search=node | Title/company/location mein search |
| GET | /jobs/1 | ID 1 ki job |
| POST | /jobs | Nayi job |
| PUT | /jobs/1 | Job ki teenon editable fields update |
| DELETE | /jobs/1 | Job remove |

POST/PUT mein title, company aur location non-empty strings honi chahiye. PUT mein teenon fields bhejo. ID server deta hai.
200 success, 201 created, 400 galat input, 404 job/route nahi mili. Search match na ho to empty array aati hai.

## Params, query aur body

- `/jobs/2`: `req.params.id` text `'2'` hai. `Number()` isay number banata hai.
- `/jobs?search=intern`: `req.query.search` text `'intern'` hai.
- POST/PUT ka JSON: `req.body` mein title, company, location milte hain.

## GET /jobs/1 ko trace karo

1. app.js ka `/jobs` router request leta hai.
2. Route `/:id` controller ke getJob ko chalata hai.
3. Controller params.id service ko deta hai.
4. Service ID validate karwati hai aur repository.findById call karti hai.
5. Repository `find()` se matching job laati hai.
6. Job missing ho to service 404 error throw karti hai; Express app.js ke error middleware ko deta hai.
7. Job milne par controller res.json se bhejta hai.

PUT mein pehle job find hoti hai, phir body validate hoti hai, phir repository `Object.assign` se fields badalti hai.
DELETE mein pehle job find hoti hai, phir repository `findIndex` se position aur `splice` se removal karti hai.
ID counter alag rakha hai: delete ke baad nayi job ko purani ID nahi milegi, jab tak server restart na ho.

## Run aur practice

Pehle terminal mein `npm.cmd start`. Code badalne ke baad Ctrl+C aur phir start. Doosre PowerShell terminal mein ye commands order mein chalao:

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

# Deleted record: ab 404 milega, PowerShell error dikhayega.
Invoke-RestMethod $jobUrl
```

## Nayi JavaScript cheezen

| Code | Matlab |
| --- | --- |
| find | Pehla matching item |
| filter | Matching items ki nayi list |
| map | Har item se value bana kar nayi list |
| ...data | Object ki fields copy |
| toLowerCase / includes | Lowercase banana / text match |
| Number.isSafeInteger | Safe range mein whole number check |
| Object.assign | Existing object ki fields badalna |
| findIndex / splice | Position dhoondna / items nikalna |
| throw new Error | Error de kar current kaam rokna |

## 5–6 ghanton ka schedule

1. 45 min: objects, arrays, functions, require/exports; sample job khud likho.
2. 45 min: server/app chalao, welcome message badlo, GET flow trace karo.
3. 60 min: layers, single job, search aur params/query samjho.
4. 60 min: POST aur validation; missing field, numeric title, spaces-only title try karo.
5. 60 min: PUT/DELETE; update ke baad GET aur delete ke baad 404 check karo.
6. 30–60 min: salary field add karo, positive number validate karo, POST/PUT se test karo.

JavaScript bhi bilkul nayi ho to waqt barh sakta hai. Har function par ruk kar apne lafzon mein batao: input kya hai, kaam kya hai, output kya hai?
