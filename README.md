# SolarSpot Frontend

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![License](https://img.shields.io/badge/License-MIT-yellow)

Solar charging station finder client built with React, TypeScript, Tailwind CSS, and shadcn/ui for SE3040 Application Frameworks.

## Prerequisites

- Node.js 20 LTS

## Quick Start

```bash
git clone <repo-url> && cd solarspot-frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | `/api` | Backend API base URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## Project Structure

```
src/
├── app/          # Redux store setup
├── components/
│   ├── ui/       # shadcn/ui primitives
│   └── shared/   # Layout, guards, common components
├── features/     # Feature modules (auth, stations, reviews, weather, users)
├── hooks/        # Custom React hooks
├── lib/          # Utilities, constants, API base config
├── pages/        # Route page components
├── router/       # React Router config
├── types/        # TypeScript interfaces
└── styles/       # Global CSS
```

## Component Architecture

UI primitives are from [shadcn/ui](https://ui.shadcn.com/) — copy-pasted, fully customizable Radix + Tailwind components. Add new ones with `npx shadcn@latest add <component>`.

## Deployment — Vercel

1. Connect repo to Vercel
2. Set `VITE_API_BASE_URL` environment variable
3. Deploy — Vite build runs automatically

## Team — Module Ownership

| Member | Module |
|--------|--------|
| Member 1 | Station Management |
| Member 2 | Review System |
| Member 3 | Weather Intelligence |
| Member 4 | Auth & Users |
