export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

export async function GET(req: NextRequest) {
  try {
    if (!supabase) return NextResponse.json({ history: [] })

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId') || undefined
    const limitRaw = Number(searchParams.get('limit') || '20')
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(100, limitRaw))
      : 20

    let query = supabase
      .from('blessings')
      .select('code, blessing, theme, created_at, session_id')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sessionId) query = query.eq('session_id', sessionId)

    const { data, error } = await query
    if (!error) return NextResponse.json({ history: data ?? [] })

    // Backward compatibility for schemas missing newer columns.
    const fallback = supabase
      .from('blessings')
      .select('code, blessing, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sessionId) {
      return NextResponse.json({
        history: [],
        warning: 'session_id column is not available in current schema.'
      })
    }

    const fallbackRes = await fallback
    return NextResponse.json({ history: fallbackRes.data ?? [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to fetch history'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
