export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const blessingCategories = [
  'love',
  'family',
  'healing',
  'protection',
  'work',
  'courage',
  'money',
  'new beginning',
  'grief / comfort',
  'gratitude'
] as const

const bodySchema = z.object({
  code: z.string().regex(/^\d{4}$/).optional(),
  category: z.enum(blessingCategories).optional(),
  daily: z.boolean().optional(),
  sessionId: z.string().min(6).max(100).optional()
}).refine(data => data.daily || !!data.code, {
  message: 'Provide a 4-digit code or request a daily blessing.'
})
const specialBlessings: Record<string, string> = {
  '7777':
    'May abundance find you in unexpected ways. May every door that is meant for you open with ease.',
  '4444':
    'May you feel protected, grounded, and steady. May peace surround your home and your heart.',
  '1212':
    'May this be a season of new beginnings. May courage rise in you exactly when you need it.'
}

const openaiApiKey = process.env.OPENAI_API_KEY?.trim()
const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null

async function getPrompt(): Promise<string> {
  if (!supabase) {
    return `Return a short, warm blessing (2–3 sentences) personalized by this code: {code}.
Keep it non-denominational, uplifting, and safe for all audiences.`
  }

  const { data } = await supabase
    .from('prompts')
    .select('content')
    .eq('active', true)
    .single()

  return data?.content || `Return a short, warm blessing (2–3 sentences) personalized by this code: {code}.
Keep it non-denominational, uplifting, and safe for all audiences.`
}

async function getDynamicSpecialBlessing(code: string): Promise<string | undefined> {
  if (!supabase) return undefined

  const { data, error } = await supabase
    .from('special_codes')
    .select('blessing')
    .eq('code', code)
    .eq('active', true)
    .single()

  if (error) return undefined
  return data?.blessing || undefined
}

function buildPrompt(code: string, category?: string, promptTemplate?: string): string {
  if (category) {
    return `Return a short blessing for the theme "${category}" using code ${code}.
Keep it non-denominational, uplifting, and safe for all audiences.`
  }

  const template = promptTemplate ||
    `Return a short, warm blessing (2–3 sentences) personalized by this code: {code}.
Keep it non-denominational, uplifting, and safe for all audiences.`

  return template.replace('{code}', code)
}

async function persistBlessing(params: {
  code: string
  blessing: string
  theme?: string
  sessionId?: string
}) {
  if (!supabase) return

  const payload = {
    code: params.code,
    blessing: params.blessing,
    theme: params.theme ?? null,
    session_id: params.sessionId ?? null
  }

  const { error } = await supabase.from('blessings').insert(payload)
  if (!error) return

  // Backward compatibility for schemas that only contain code + blessing.
  await supabase.from('blessings').insert({
    code: params.code,
    blessing: params.blessing
  })
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { code, category, daily, sessionId } = bodySchema.parse(json)
    const todayCode = new Date().toISOString().slice(0, 10)
    const resolvedCode = daily ? todayCode : code!

    const specialBlessing = !daily
      ? specialBlessings[resolvedCode] || await getDynamicSpecialBlessing(resolvedCode)
      : undefined
    if (specialBlessing) {
      await persistBlessing({
        code: resolvedCode,
        blessing: specialBlessing,
        theme: category,
        sessionId
      })
      return NextResponse.json({ blessing: specialBlessing })
    }

    if (!openai) {
      return NextResponse.json(
        {
          error:
            'Missing OPENAI_API_KEY. Add it to .env.local and restart the dev server.'
        },
        { status: 500 }
      )
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const promptTemplate = await getPrompt()
    const prompt = buildPrompt(resolvedCode, category, promptTemplate)

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    })

    const text = completion.choices[0]?.message?.content?.trim() ||
      'May your day be light, your steps steady, and your heart at ease.'

    await persistBlessing({
      code: resolvedCode,
      blessing: text,
      theme: category,
      sessionId
    })

    return NextResponse.json({ blessing: text })
  } catch (err: unknown) {
    console.error('API Error:', err)
    const message = err instanceof Error ? err.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
