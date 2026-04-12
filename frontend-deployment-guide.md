# Frontend Deployment Guide

This guide explains how to run and deploy SolarSpot frontend in local, Vercel, and Docker environments.

## 1. Deployment Model

SolarSpot frontend is a Vite SPA that expects API calls under `/api`.

- Browser calls: `/api/...`
- In Vercel: `vercel.json` rewrites `/api/*` to Render backend
- In Docker+Nginx: Nginx forwards `/api/*` to backend container
- In local dev: Vite proxy forwards `/api/*` to your local backend port

This pattern avoids browser CORS issues by keeping API calls same-origin from the browser perspective.

## 2. Environment Variables

Use these variables:

- `VITE_API_BASE_URL` (default `/api`)
- `VITE_PROXY_TARGET` (local dev proxy target, example: `http://localhost:5001`)
- `VITE_ENABLE_ADMIN_APIS` (`true` or `false`)

Current `.env.example` baseline:

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:5000
VITE_ENABLE_ADMIN_APIS=false
```

Recommended local override in `.env.local`:

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:5001
VITE_ENABLE_ADMIN_APIS=true
```

Notes:

- In production runtime, frontend uses `/api` paths.
- `VITE_PROXY_TARGET` is for Vite dev server only.

## 3. Local Development Deployment

### 3.1 Prerequisites

- Node.js 20 LTS
- Running backend API (for example on `localhost:5001`)

### 3.2 Steps

```bash
git clone <repo-url>
cd solarspot-frontend
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

### 3.3 Verify Backend Connectivity

Check that backend is alive on your selected port:

```bash
curl -i http://localhost:5001/health
# or
curl -i http://localhost:5001/api/health
```

If these fail, frontend API calls will fail too.

## 4. Vercel Deployment

### 4.1 Existing Behavior

`vercel.json` already rewrites:

- `/api/:path*` -> `https://solarspot-api.onrender.com/api/:path*`
- All other routes -> `/index.html` (SPA fallback)

### 4.2 Steps

1. Connect repository in Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Ensure backend URL in `vercel.json` is correct for your environment.
5. Deploy.

### 4.3 Post-Deploy Checks

- Open app root route and a deep route (for example `/stations/abc`) to confirm SPA fallback.
- Confirm auth and station API requests return 2xx/4xx expected responses, not 5xx.

## 5. Docker + Nginx Deployment

This repo includes:

- Multi-stage `Dockerfile` to build and serve static assets
- `nginx.conf` to:
  - serve SPA
  - proxy `/api/*` to `http://backend:5000`

### 5.1 Build

```bash
docker build -t solarspot-frontend .
```

### 5.2 Run

```bash
docker run --rm -p 3000:80 solarspot-frontend
```

In compose/networked setup, ensure backend service is reachable by hostname `backend` on port `5000`.

## 6. Common Problems and Fixes

### Problem: Vite proxy `ECONNRESET` on `/api/*`

Symptoms:

- `http proxy error`
- `read ECONNRESET`

Causes:

- Backend not running
- Wrong `VITE_PROXY_TARGET`
- Port conflict (service on port is not your backend)
- Backend process crashes on startup

Fix:

1. Confirm listener on target port:

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

2. Confirm process is your backend (not another app).
3. Confirm backend health endpoint.
4. Check backend logs for crash traces.
5. Restart backend and `npm run dev` frontend.

### Problem: Works in local but fails in Vercel

Check:

- `vercel.json` API rewrite destination
- Backend uptime and rate limits
- Backend CORS/cookie config if login uses credentials

### Problem: Refresh/login loops

Check:

- `/api/auth/refresh` backend availability
- Cookie domain, secure, and same-site settings in backend
- Time skew and token expiration config

## 7. Release Checklist

Before release:

- `npm run lint`
- `npm run build`
- Verify `.env.local` is not committed
- Verify Vercel rewrites point to correct backend
- Smoke test routes:
  - `/`
  - `/login`
  - `/stations`
  - `/dashboard`
  - one admin route with proper user

## 8. Ownership Notes

- Member 4 (Auth & Users) should validate auth flows in each environment:
  - register
  - verify email
  - login
  - refresh
  - logout
  - forgot/reset password
- Member 1 should validate station API interactions after deployment.
