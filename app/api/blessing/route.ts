export const runtime = 'nodejs' // ensure Node runtime on Vercel (not Edge)

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const bodySchema = z.object({ code: z.string().regex(/^\d{4}$/) })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { code } = bodySchema.parse(json)

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const prompt = `Return a short, warm blessing (2–3 sentences) personalized by this code: ${code}.
Keep it non-denominational, uplifting, and safe for all audiences.`

    const completion = await openai.responses.create({ model, input: prompt })
    const text =
      completion.output_text?.trim() ||
      'May your day be light, your steps steady, and your heart at ease.'

    if (supabase) await supabase.from('blessings').insert({ code, blessing: text })

    return NextResponse.json({ blessing: text })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 })
  }
}
