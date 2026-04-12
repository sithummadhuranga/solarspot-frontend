# Frontend Main Guide

This is the main documentation for the SolarSpot frontend. It covers architecture, local development, module ownership, coding workflow, deployment, and troubleshooting.

## 1. Project Overview

SolarSpot frontend is a React + TypeScript single-page application built with Vite and Tailwind.

Core technologies:

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- Redux Toolkit (auth and selected feature state)
- React Query (server-state for stations and related data)
- Axios API clients

## 2. Frontend Structure

Main source folders:

- `src/pages`: route-level pages
- `src/components`: reusable UI and feature components
- `src/features`: feature modules (auth, users, reviews, weather, permissions)
- `src/hooks`: reusable hooks
- `src/api`: API clients/wrappers
- `src/router`: route declarations
- `src/guards`: auth/role/permission route guards
- `src/types`: TypeScript DTOs and domain types

High-level data flow:

1. UI components trigger hooks.
2. Hooks call API wrappers or feature APIs.
3. Responses are normalized and rendered.
4. Guards control route access based on auth and permission context.

## 3. Module Ownership

| Member | Module |
|--------|--------|
| Sathush Nanyakkara (@sathushnanayakkara) | Station Management |
| Nimnath Nadushka (@nnimnath) | Review System |
| Sithum Madhuranga (@sithummadhuranga) | Weather Intelligence |
| Christine Lowe (@shwethalowe) | Auth & Users |

Ownership guidance:

- Module owner reviews and validates behavior changes in their area.
- Cross-module changes require at least one reviewer from each affected module.

## 4. Local Development Setup

### 4.1 Prerequisites

- Node.js 20 LTS
- Running backend API

### 4.2 Environment Variables

Required and commonly used:

- `VITE_API_BASE_URL` (default `/api`)
- `VITE_PROXY_TARGET` (Vite dev proxy target, example: `http://localhost:5001`)
- `VITE_ENABLE_ADMIN_APIS` (`true` or `false`)

Recommended `.env.local`:

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:5001
VITE_ENABLE_ADMIN_APIS=true
```

Notes:

- `VITE_PROXY_TARGET` is only for local Vite dev proxy.
- Production runtime should keep API base usage on `/api` and rely on platform rewrites/proxies.

### 4.3 Start the App

```bash
git clone <repo-url>
cd solarspot-frontend
cp .env.example .env.local
npm install
npm run dev
```

Local frontend URL: `http://localhost:3000`

### 4.4 Development Scripts

- `npm run dev`: start dev server
- `npm run build`: type-check + production build
- `npm run preview`: preview production build
- `npm run lint`: lint checks
- `npm run format`: format code

## 5. API and Auth Model

API pattern:

- Browser makes requests to `/api/...`.
- Dev mode: Vite proxy forwards to `VITE_PROXY_TARGET`.
- Production: infrastructure rewrites/proxies `/api` to backend.

Auth pattern:

- Access token state is managed in frontend auth store.
- Refresh flow depends on backend refresh endpoint and cookie settings.
- Route access is controlled through auth and permission guards.

## 6. Routing and Guarding

Guard types used:

- `ProtectedRoute`: blocks unauthenticated access
- `RoleGuard`: role-constrained routes
- `BackendPermissionGuard`: permission-based access checks

When adding a protected page:

1. Add page component under `src/pages`.
2. Add route entry in router config.
3. Wrap with suitable guard(s).
4. Add nav entries in shared navigation components where appropriate.

## 7. Deployment

### 7.1 Deployment Model

- In Vercel: `vercel.json` rewrites `/api/*` to backend and falls back SPA routes to `index.html`.
- In Docker + Nginx: Nginx serves static assets and proxies `/api/*` to backend service.

### 7.2 Vercel Deployment

1. Connect repository to Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Confirm `vercel.json` rewrite target is correct.
5. Deploy and validate deep-link routes.

### 7.3 Docker + Nginx Deployment

Build image:

```bash
docker build -t solarspot-frontend .
```

Run container:

```bash
docker run --rm -p 3000:80 solarspot-frontend
```

For compose/networked setups, ensure backend is reachable as configured in `nginx.conf`.

## 8. Quality and Release Checklist

Before merge/release:

- `npm run lint`
- `npm run build`
- verify `.env.local` is not committed
- verify route guards for new pages
- smoke test key routes (`/`, `/login`, `/stations`, `/dashboard`, admin route)
- validate API error handling paths (401/403/500)

## 9. Troubleshooting

### Vite proxy `ECONNRESET`

Common causes:

- backend not running
- wrong `VITE_PROXY_TARGET`
- port collision
- backend process crash during startup

Quick checks:

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
curl -i http://localhost:5001/health
curl -i http://localhost:5001/api/health
```

### Works locally but fails in Vercel

Check:

- `vercel.json` rewrite destination
- backend availability and quotas
- backend cookie/CORS behavior for auth flows

### Refresh/login loops

Check:

- `/api/auth/refresh` health
- cookie domain, secure, and same-site backend config
- token TTL configuration and clock skew

## 10. Contribution Workflow

Recommended branch flow:

1. Sync with latest `main`.
2. Create feature/fix branch.
3. Keep changes scoped to one module when possible.
4. Run lint + build before pushing.
5. Open PR with test notes and impacted routes.

PR checklist:

- problem statement
- changed files summary
- screenshots for UI changes
- API contract changes (if any)
- risk notes and rollback plan
