import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, supabase, unauthorized } from '../_shared'

const defaultSpecialCodes: Array<{ code: string; blessing: string; theme?: string }> = [
  {
    code: '7777',
    blessing:
      'May abundance find you in unexpected ways. May every door that is meant for you open with ease.',
    theme: 'abundance'
  },
  {
    code: '4444',
    blessing:
      'May you feel protected, grounded, and steady. May peace surround your home and your heart.',
    theme: 'protection'
  },
  {
    code: '1212',
    blessing:
      'May this be a season of new beginnings. May courage rise in you exactly when you need it.',
    theme: 'new beginning'
  }
]

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()

  if (!supabase) {
    return NextResponse.json({ specialCodes: defaultSpecialCodes })
  }

  const { data, error } = await supabase
    .from('special_codes')
    .select('code, blessing, theme, active')
    .eq('active', true)
    .order('code', { ascending: true })

  if (error) {
    return NextResponse.json({
      specialCodes: defaultSpecialCodes,
      warning: 'special_codes table not found; showing built-ins only'
    })
  }

  return NextResponse.json({ specialCodes: data })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { code, blessing, theme } = await req.json()

    if (!/^\d{4}$/.test(code || '')) {
      return NextResponse.json({ error: 'Code must be exactly 4 digits' }, { status: 400 })
    }

    if (!blessing || typeof blessing !== 'string') {
      return NextResponse.json({ error: 'Blessing is required' }, { status: 400 })
    }

    const { error } = await supabase.from('special_codes').upsert({
      code,
      blessing,
      theme: typeof theme === 'string' ? theme : null,
      active: true
    })

    if (error) {
      return NextResponse.json({
        error:
          'Failed to save special code. Ensure special_codes table exists with columns: code, blessing, theme, active.'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save special code'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
