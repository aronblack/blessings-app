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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional): enables Supabase prompt/history features.

If you change `.env.local`, restart the dev server.
