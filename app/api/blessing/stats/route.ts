export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ mostUsedCodes: [] })

    const { data, error } = await supabase
      .from('blessings')
      .select('code')
      .limit(1000)

    if (error) {
      return NextResponse.json({ mostUsedCodes: [] })
    }

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const code = (row.code || '').toString().trim()
      if (!code) continue
      counts.set(code, (counts.get(code) || 0) + 1)
    }

    const mostUsedCodes = Array.from(counts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({ mostUsedCodes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to fetch stats'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
