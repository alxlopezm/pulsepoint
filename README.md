# PulsePoint

A web app for tracking technology initiatives — status, ownership, progress updates, and next steps — across business units.

## Stack

React 18 + TypeScript, Vite, Tailwind CSS v4, React Router v7, Supabase (Postgres, Auth, Row Level Security, Realtime).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com), then copy `.env.local` and fill in your project's URL and anon key (Project Settings → API):

   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

3. Apply the database schema. Migrations live in `supabase/migrations/` and include the full schema, RLS policies, seed data for business units, and realtime publication config:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. In the Supabase dashboard, under Authentication → Providers, confirm Email sign-in is enabled. Under Authentication → URL Configuration, set the Site URL (and add to the redirect allow-list) to match your dev server, e.g. `http://localhost:5173`.

5. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Database

All tables (`initiatives`, `updates`, `next_steps`) are scoped to the authenticated user via Row Level Security — `initiatives.user_id` directly, and `updates`/`next_steps` transitively through their parent initiative. `business_units` is shared reference data, readable by any authenticated user.

A next step's displayed status (completed / overdue / pending) is derived client-side from `completion_date` and `due_date`, not stored.

## Troubleshooting

**`npm install`/`supabase` commands fail with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`**: some antivirus suites (e.g. Norton's "Web/Mail Shield") intercept HTTPS traffic with their own certificate, which Node doesn't trust by default. Export the offending root certificate from the Windows certificate store and point Node at it via the `NODE_EXTRA_CA_CERTS` environment variable, rather than disabling TLS verification.
