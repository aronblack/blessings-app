import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSupabase } from '@/lib/serverSupabase'
import { getStripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'

async function upsertPremiumByEmail(input: {
  email: string
  customerId: string
  subscriptionId?: string | null
  active: boolean
  plan?: string | null
  premiumExpiresAt?: string | null
}) {
  const supabase = getServerSupabase()
  if (!supabase) return

  const payload = {
    email: input.email.toLowerCase(),
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId || null,
    premium_active: input.active,
    premium_plan: input.plan || null,
    premium_expires_at: input.premiumExpiresAt || null,
    premium_updated_at: new Date().toISOString()
  }

  const upsertRes = await supabase
    .from('subscribers')
    .upsert(payload, { onConflict: 'email' })

  if (!upsertRes.error) return

  // Fallback for older schemas that only store email/mobile.
  await supabase.from('subscribers').upsert(
    { email: input.email.toLowerCase() },
    { onConflict: 'email' }
  )
}

async function updatePremiumByCustomer(input: {
  customerId: string
  subscriptionId?: string | null
  active: boolean
  plan?: string | null
  premiumExpiresAt?: string | null
}) {
  const supabase = getServerSupabase()
  if (!supabase) return

  const updatePayload = {
    stripe_subscription_id: input.subscriptionId || null,
    premium_active: input.active,
    premium_plan: input.plan || null,
    premium_expires_at: input.premiumExpiresAt || null,
    premium_updated_at: new Date().toISOString()
  }

  const byCustomer = await supabase
    .from('subscribers')
    .update(updatePayload)
    .eq('stripe_customer_id', input.customerId)

  if (!byCustomer.error) return

  // Fallback for older schemas that do not have premium columns.
  await supabase
    .from('subscribers')
    .update({})
    .eq('stripe_customer_id', input.customerId)
}

function getPlanName(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0]
  return item?.price?.nickname || item?.price?.id || null
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const item = subscription.items.data[0]
  return item?.current_period_end || null
}

function toIsoFromUnix(seconds?: number | null): string | null {
  if (!seconds) return null
  return new Date(seconds * 1000).toISOString()
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  try {
    const body = await request.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = typeof session.customer === 'string' ? session.customer : null
      const email = session.customer_details?.email || session.customer_email || null
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

      if (customerId && email) {
        let premiumExpiresAt: string | null = null
        let plan: string | null = null

        if (subscriptionId) {
          const subscriptionRes = await stripe.subscriptions.retrieve(subscriptionId)
          const subscription = subscriptionRes as unknown as Stripe.Subscription
          premiumExpiresAt = toIsoFromUnix(getCurrentPeriodEnd(subscription))
          plan = getPlanName(subscription)
        }

        await upsertPremiumByEmail({
          email,
          customerId,
          subscriptionId,
          active: true,
          plan,
          premiumExpiresAt
        })
      }
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : null

      if (customerId) {
        const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status)

        await updatePremiumByCustomer({
          customerId,
          subscriptionId: subscription.id,
          active: event.type === 'customer.subscription.deleted' ? false : isActive,
          plan: getPlanName(subscription),
          premiumExpiresAt: toIsoFromUnix(getCurrentPeriodEnd(subscription))
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
