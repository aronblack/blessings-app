import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized, supabase, unauthorized } from '../_shared'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return unauthorized()
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('active', true)
    .single()

  if (error) {
    return NextResponse.json({ 
      prompt: `Return a short, warm blessing (2–3 sentences) personalized by this code: {code}.
Keep it non-denominational, uplifting, and safe for all audiences.` 
    })
  }

  return NextResponse.json({ prompt: data.content })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return unauthorized()
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { prompt } = await req.json()

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  // Deactivate old prompts
  await supabase.from('prompts').update({ active: false }).eq('active', true)
  
  // Insert new prompt
  const { error } = await supabase
    .from('prompts')
    .insert({ content: prompt, active: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}