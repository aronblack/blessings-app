import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { defaultLocale, locales } from '@/lib/i18n'
import { applyRateLimit, getClientIp } from '@/lib/rateLimit'
import { getStripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'

const bodySchema = z.object({
  locale: z.enum(locales).optional(),
  email: z.string().trim().email().optional()
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = applyRateLimit({
      key: `checkout:${ip}`,
      limit: 10,
      windowMs: 10 * 60_000,
      blockMs: 30 * 60_000
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) }
        }
      )
    }

    const stripe = getStripeClient()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY
    if (!priceId) {
      return NextResponse.json({ error: 'Missing STRIPE_PRICE_ID_MONTHLY' }, { status: 500 })
    }

    const payload = bodySchema.safeParse(await request.json().catch(() => ({})))
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 })
    }

    const locale = payload.data.locale || defaultLocale
    const origin = request.headers.get('origin')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'http://localhost:3000'

    const successUrl = `${siteUrl}/${locale}?checkout=success`
    const cancelUrl = `${siteUrl}/${locale}?checkout=cancel`

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      customer_email: payload.data.email,
      metadata: {
        locale
      }
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
