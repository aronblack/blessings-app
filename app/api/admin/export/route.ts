import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, supabase, unauthorized } from '../_shared'

function csvEscape(value: unknown) {
  const str = (value ?? '').toString().replace(/\"/g, '""')
  return `"${str}"`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const preferred = await supabase
    .from('blessings')
    .select('id, code, blessing, theme, session_id, created_at, approved, blocked')
    .order('created_at', { ascending: false })
    .limit(5000)

  const rows = preferred.error
    ? (await supabase
        .from('blessings')
        .select('id, code, blessing, created_at')
        .order('created_at', { ascending: false })
        .limit(5000)).data || []
    : preferred.data || []

  const header = ['id', 'code', 'blessing', 'theme', 'session_id', 'created_at', 'approved', 'blocked']
  const lines = [header.join(',')]

  for (const row of rows as Array<Record<string, unknown>>) {
    lines.push([
      csvEscape(row.id),
      csvEscape(row.code),
      csvEscape(row.blessing),
      csvEscape(row.theme),
      csvEscape(row.session_id),
      csvEscape(row.created_at),
      csvEscape(row.approved),
      csvEscape(row.blocked)
    ].join(','))
  }

  const csv = lines.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="blessings-export-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  })
}
