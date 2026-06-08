import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { applyRateLimit, getClientIp } from '@/lib/rateLimit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
  mobile: z.string().trim().max(40).optional(),
  website: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = applyRateLimit({
      key: `subscribe:${ip}`,
      limit: 6,
      windowMs: 10 * 60_000,
      blockMs: 30 * 60_000
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) }
        }
      )
    }

    const payload = bodySchema.parse(await request.json())

    // Honeypot field for basic bot filtering.
    if (payload.website && payload.website.trim().length > 0) {
      return NextResponse.json({ message: 'Successfully subscribed to daily blessings!' })
    }

    const email = payload.email.trim().toLowerCase()
    const mobile = payload.mobile?.trim() || null


    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { error } = await supabase.from('subscribers').insert({
      email,
      mobile: mobile || null
    })

    if (error) {
      console.error('Subscription insert error:', error)
      const message = error.message || 'Failed to save subscription'
      const isDuplicate =
        message.toLowerCase().includes('duplicate key') ||
        message.toLowerCase().includes('unique constraint')

      if (isDuplicate) {
        return NextResponse.json({
          message: 'You are already subscribed to daily blessings.'
        })
      }

      const friendlyMessage =
        message.includes('fetch failed') || message.includes('ENOTFOUND')
          ? 'Subscription database is unreachable. Check NEXT_PUBLIC_SUPABASE_URL.'
          : message

      return NextResponse.json(
        { error: friendlyMessage },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Successfully subscribed to daily blessings!' 
    })

  } catch (error) {
    console.error('Subscription error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}