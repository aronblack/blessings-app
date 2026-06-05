import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

export async function POST(request: NextRequest) {
  try {
    const { email, mobile } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

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
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}