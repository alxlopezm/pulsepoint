# PulsePoint

A web app for tracking technology initiatives — status, ownership, progress updates, and next steps — across business units. Runs entirely locally: no cloud backend-as-a-service dependency.

## Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS v4, React Router v7, `socket.io-client`
- **Backend**: Node.js + Express + TypeScript, Prisma, PostgreSQL, `jsonwebtoken` + `bcrypt` for auth, `socket.io` for realtime
- **Database**: PostgreSQL with native Row Level Security — a restricted, non-superuser role enforces per-user ownership at the database layer, replacing Supabase's RLS

This is a monorepo with two npm workspaces: [`frontend/`](frontend) and [`backend/`](backend).

## Prerequisites

- Node.js 20+
- PostgreSQL 16, either:
  - a local install listening on `localhost:5432`, or
  - Docker, using the provided `docker-compose.yml`

## Setup

1. Install dependencies for both workspaces from the repo root:

   ```bash
   npm install
   ```

2. Start Postgres. Either use your own local install, or:

   ```bash
   docker compose up -d
   ```

3. Configure the backend. Copy `backend/.env.example` to `backend/.env` and adjust if needed — the defaults match `docker-compose.yml`:

   ```bash
   cp backend/.env.example backend/.env
   ```

   - `DATABASE_URL` — owner/superuser connection, used only for migrations and seeding
   - `APP_DATABASE_URL` — restricted `pulsepoint_app` role the running server actually connects as, so Postgres enforces Row Level Security (this role is created by the second migration, see [Database](#database) below)
   - `JWT_SECRET` — set this to a long random string
   - `PORT` — API port (default `4000`)
   - `CORS_ORIGIN` — the frontend dev server origin (default `http://localhost:5173`)

4. Run migrations and seed the business units:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. Configure the frontend. Copy `frontend/.env.example` to `frontend/.env.local`:

   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

   - `VITE_API_URL` — the backend's URL (default `http://localhost:4000`)

6. Start both dev servers from the repo root:

   ```bash
   npm run dev
   ```

   Frontend: [http://localhost:5173](http://localhost:5173). Backend: [http://localhost:4000](http://localhost:4000).

## Logging in

There's no seeded account — sign up from the app with any email/password (6+ characters). Signup creates the account and logs you in immediately; there's no email-confirmation step since there's no mail server in this local setup.

## Scripts (run from repo root)

- `npm run dev` — start backend and frontend dev servers together
- `npm run build` — type-check and build both workspaces
- `npm run lint` — lint both workspaces
- `npm run prisma:migrate` — apply Prisma migrations against `DATABASE_URL`
- `npm run prisma:seed` — seed the business units (Finance, R&D, Manufacturing, GI, Infrastructure, Customer Experience, Security)

Each workspace also has its own scripts — see `frontend/package.json` and `backend/package.json` (e.g. `npm run build -w backend`, `npm run preview -w frontend`).

## Database

Schema and migrations live in `backend/prisma/schema.prisma` and `backend/prisma/migrations/`:

- `20260806000000_init` — tables, enums, indexes, foreign keys
- `20260806000001_row_level_security` — creates the restricted `pulsepoint_app` role and enables RLS with `CREATE POLICY` on `initiatives`, `updates`, and `next_steps`, scoped by a `app.current_user_id` Postgres session variable that the Express app sets per-request (in place of Supabase's `auth.uid()`). `business_units` is public read-only reference data.

Ownership: `initiatives.created_by` directly; `updates`/`next_steps` transitively through their parent initiative. Table owners and superusers bypass RLS in Postgres, which is why the running server connects as `pulsepoint_app` (`APP_DATABASE_URL`) rather than the migration role (`DATABASE_URL`).

A next step's `status` (`pending` / `started` / `completed` / `overdue`) is stored, not purely derived: filling in a completion date marks it completed, and it's swept to `overdue` lazily (on read) once its due date has passed without completion. Marking a step "started" is a manual action in the UI.

## Realtime

The backend emits `socket.io` events (`initiatives:changed`, `initiative:changed`, `updates:changed`, `next-steps:changed`, `summary:changed`) to a per-user room after each mutation; the frontend listens and refetches. This replaces Supabase Realtime's `postgres_changes` subscriptions.

## Non-goals

No Supabase SDK, no Supabase Auth, no cloud dependency, no deployment config — this is for local development only.
