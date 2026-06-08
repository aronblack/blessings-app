-- Add premium/Stripe tracking columns for paid subscriptions.
alter table if exists public.subscribers
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists premium_active boolean not null default false,
  add column if not exists premium_plan text,
  add column if not exists premium_expires_at timestamptz,
  add column if not exists premium_updated_at timestamptz;

create unique index if not exists subscribers_stripe_customer_id_idx
  on public.subscribers (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists subscribers_stripe_subscription_id_idx
  on public.subscribers (stripe_subscription_id)
  where stripe_subscription_id is not null;
