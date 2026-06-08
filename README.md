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
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional): enables Google Analytics 4 tracking.
- `NEXT_PUBLIC_SITE_URL` (recommended in production): canonical app URL used in metadata and billing redirects.
- `NEXT_PUBLIC_SUPABASE_URL` (optional): enables Supabase prompt/history features.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (optional): enables Supabase prompt/history features.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy fallback): also supported for older setups.
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for subscriptions): lets the server create subscriber rows without exposing write access to the browser.
- `STRIPE_SECRET_KEY` (required for billing): server key for creating checkout sessions.
- `STRIPE_PRICE_ID_MONTHLY` (required for billing): Stripe recurring price ID used by checkout.
- `STRIPE_WEBHOOK_SECRET` (required for billing sync): validates Stripe webhook signatures.

## Subscribers table

If you want the subscription form to persist emails, create a `subscribers` table in Supabase with the SQL in [supabase/create-subscribers-table.sql](supabase/create-subscribers-table.sql).

To enable premium billing flags on subscribers, also run [supabase/add-premium-columns.sql](supabase/add-premium-columns.sql).

If you only configure the anon key, make sure you also add an insert policy for that table. Using the service role key on the server is the safer default.

If you change `.env.local`, restart the dev server.

## Stripe billing setup

1. Create a recurring product + price in Stripe and copy the `price_...` ID.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL` in your environment.
3. Point Stripe webhook events to `https://your-domain.com/api/billing/webhook`.
4. Subscribe to at least these events:
	- `checkout.session.completed`
	- `customer.subscription.created`
	- `customer.subscription.updated`
	- `customer.subscription.deleted`

The premium CTA on the home page posts to `app/api/billing/checkout/route.ts`, and webhook updates map premium status onto rows in `subscribers`.
