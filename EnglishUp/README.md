# EnglishUp Backend

Lightweight instructions to run the backend locally.

Project folder: `d:\New folder (4)\EnglishUp\englishfive\EnglishUp`

Requirements
- Node.js 16+ (or compatible)
- MongoDB running locally on `mongodb://localhost:27017` (optional for some endpoints)

Install dependencies
```powershell
cd "d:\New folder (4)\EnglishUp\englishfive\EnglishUp"
npm install
```

Run server (foreground)
```powershell
npm start
# or
node server.js
```

Run server in background (PowerShell)
```powershell
Start-Process -FilePath node -ArgumentList server.js -WorkingDirectory "d:\New folder (4)\EnglishUp\englishfive\EnglishUp"
```

Stop server (find PID then kill)
```powershell
netstat -ano | findstr ":3000"
# assume PID is 1234
taskkill /PID 1234 /F
```

Available endpoints (examples)
- GET `/` — health check (returns { status: 'ok', message: 'Backend API running' })
- Auth: POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`
- Users: GET `/api/users/`, POST `/api/users/`, PUT `/api/users/:id`, DELETE `/api/users/:id` (these require auth middleware)

If you want automatic reload in development, install `nodemon` and add a `dev` script:
```powershell
npm install -D nodemon
# then in package.json add: "dev": "nodemon server.js"
```

If you want, I can add the `dev` script for you and a basic `.env`/config example.

Integrate frontend (Vite) with backend
--------------------------------------
This project contains a frontend in `../feEngLish` (Vite + React). To integrate and serve the built frontend from this backend:

1. Build the frontend

```powershell
cd "d:\New folder (4)\EnglishUp\englishfive\feEngLish"
npm install
npm run build
```

2. Start the backend (it will serve files from `feEngLish/dist` at the root `/`)

```powershell
cd "d:\New folder (4)\EnglishUp\englishfive\EnglishUp"
npm start
```

Notes:
- The backend uses `@fastify/static` to serve files from `feEngLish/dist` and provides an SPA fallback to `index.html` for client-side routing.
- If you prefer a single command to build & run, we can add a `start:full` script to `package.json` that runs the frontend build then starts the backend.

Want me to add the `start:full` script and a `dev` script with `concurrently`/`nodemon` for easy local dev? I can add them now.
