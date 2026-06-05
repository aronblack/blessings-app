# Blessings App

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Set `OPENAI_API_KEY` in `.env.local`.

4. Start the app:

```bash
pnpm dev
```

Open http://localhost:3000.

## Environment variables

- `OPENAI_API_KEY` (required): used by `app/api/blessing/route.ts` to generate blessings.
- `OPENAI_MODEL` (optional): defaults to `gpt-4o-mini`.
- `NEXT_PUBLIC_SUPABASE_URL` (optional): enables Supabase prompt/history features.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (optional): enables Supabase prompt/history features.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy fallback): also supported for older setups.
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for subscriptions): lets the server create subscriber rows without exposing write access to the browser.

## Subscribers table

If you want the subscription form to persist emails, create a `subscribers` table in Supabase with the SQL in [supabase/create-subscribers-table.sql](supabase/create-subscribers-table.sql).

If you only configure the anon key, make sure you also add an insert policy for that table. Using the service role key on the server is the safer default.

If you change `.env.local`, restart the dev server.
