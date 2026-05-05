import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, supabase, unauthorized } from '../_shared'

interface BlessingRow {
  id?: string | number
  code: string
  blessing: string
  theme?: string | null
  session_id?: string | null
  created_at?: string | null
  approved?: boolean | null
  blocked?: boolean | null
}

interface UsageSummary {
  usageCount: number
  mostUsedCodes: Array<{ code: string; count: number }>
}

async function fetchBlessings(limit: number): Promise<BlessingRow[]> {
  if (!supabase) return []

  const preferred = await supabase
    .from('blessings')
    .select('id, code, blessing, theme, session_id, created_at, approved, blocked')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!preferred.error && preferred.data) {
    return preferred.data as BlessingRow[]
  }

  const fallback = await supabase
    .from('blessings')
    .select('id, code, blessing, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (fallback.data as BlessingRow[]) || []
}

async function fetchUsageSummary(maxRows = 5000): Promise<UsageSummary> {
  if (!supabase) {
    return { usageCount: 0, mostUsedCodes: [] }
  }

  const usageMap = new Map<string, number>()
  const pageSize = 1000
  let offset = 0
  let scanned = 0

  while (scanned < maxRows) {
    const { data, error } = await supabase
      .from('blessings')
      .select('code')
      .range(offset, offset + pageSize - 1)

    if (error || !data?.length) break

    for (const row of data as Array<{ code?: string | null }>) {
      const code = (row.code || '').trim()
      if (!code) continue
      usageMap.set(code, (usageMap.get(code) || 0) + 1)
    }

    scanned += data.length
    if (data.length < pageSize) break
    offset += pageSize
  }

  const countRes = await supabase
    .from('blessings')
    .select('code', { count: 'exact', head: true })

  const usageCount = countRes.count ?? scanned
  const mostUsedCodes = Array.from(usageMap.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return { usageCount, mostUsedCodes }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limitRaw = Number(searchParams.get('limit') || '100')
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(500, limitRaw))
      : 100

    const rows = await fetchBlessings(limit)
    const usage = await fetchUsageSummary()

    const usageCount = usage.usageCount
    const blockedCount = rows.filter(r => r.blocked).length
    const approvedCount = rows.filter(r => r.approved).length
    const mostUsedCodes = usage.mostUsedCodes

    return NextResponse.json({
      blessings: rows,
      summary: {
        usageCount,
        approvedCount,
        blockedCount,
        mostUsedCodes
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load blessings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { id, action, blessing } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing blessing id' }, { status: 400 })
    }

    if (!['edit', 'approve', 'block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'edit') {
      if (!blessing || typeof blessing !== 'string') {
        return NextResponse.json({ error: 'Invalid blessing text' }, { status: 400 })
      }

      const { error } = await supabase
        .from('blessings')
        .update({ blessing })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to edit blessing' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('blessings')
        .update({ approved: true })
        .eq('id', id)

      if (error) {
        // Schema may not have approved column. Allow graceful success.
        return NextResponse.json({ success: true, warning: 'approved column not found' })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'block') {
      const updateRes = await supabase
        .from('blessings')
        .update({ blocked: true })
        .eq('id', id)

      if (!updateRes.error) return NextResponse.json({ success: true })

      // Fallback: delete the output if blocked column does not exist.
      const delRes = await supabase.from('blessings').delete().eq('id', id)
      if (delRes.error) {
        return NextResponse.json({ error: 'Failed to block output' }, { status: 500 })
      }

      return NextResponse.json({ success: true, warning: 'blocked column not found; row deleted' })
    }

    const { error } = await supabase
      .from('blessings')
      .update({ blocked: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: true, warning: 'blocked column not found' })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update blessing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
