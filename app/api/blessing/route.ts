export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Locale, defaultLocale, getLanguageName, locales } from '@/lib/i18n'
import { applyRateLimit, getClientIp } from '@/lib/rateLimit'

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
  sessionId: z.string().min(6).max(100).optional(),
  locale: z.enum(locales).optional()
}).refine(data => data.daily || !!data.code, {
  message: 'Provide a 4-digit code or request a daily blessing.'
})
const specialBlessingsByLocale: Record<Locale, Record<string, string>> = {
  en: {
    '7777':
      'May abundance find you in unexpected ways. May every door that is meant for you open with ease.',
    '4444':
      'May you feel protected, grounded, and steady. May peace surround your home and your heart.',
    '1212':
      'May this be a season of new beginnings. May courage rise in you exactly when you need it.'
  },
  es: {
    '7777':
      'Que la abundancia te encuentre de formas inesperadas. Que cada puerta que esta hecha para ti se abra con facilidad.',
    '4444':
      'Que te sientas protegido, enraizado y firme. Que la paz rodee tu hogar y tu corazon.',
    '1212':
      'Que esta sea una temporada de nuevos comienzos. Que el valor surja en ti justo cuando lo necesites.'
  },
  it: {
    '7777':
      'Che l abbondanza ti raggiunga in modi inaspettati. Che ogni porta destinata a te si apra con facilita.',
    '4444':
      'Che tu possa sentirti protetto, saldo e stabile. Che la pace avvolga la tua casa e il tuo cuore.',
    '1212':
      'Che questa sia una stagione di nuovi inizi. Che il coraggio cresca in te proprio quando ne hai bisogno.'
  },
  de: {
    '7777':
      'Moge dich Fulle auf unerwartete Weise finden. Moge sich jede Tur, die fur dich bestimmt ist, mit Leichtigkeit offnen.',
    '4444':
      'Mogest du dich geschutzt, geerdet und stabil fuhlen. Moge Frieden dein Zuhause und dein Herz umgeben.',
    '1212':
      'Moge dies eine Zeit neuer Anfange sein. Moge Mut in dir aufsteigen, genau wenn du ihn brauchst.'
  },
  fr: {
    '7777':
      'Que l abondance te trouve de facons inattendues. Que chaque porte faite pour toi s ouvre avec aisance.',
    '4444':
      'Que tu te sentes protege, ancre et stable. Que la paix entoure ton foyer et ton coeur.',
    '1212':
      'Que cette periode soit celle des nouveaux commencements. Que le courage monte en toi au moment exact ou tu en as besoin.'
  }
}

const openaiApiKey = process.env.OPENAI_API_KEY?.trim()
const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
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

function buildPrompt(code: string, locale: Locale, category?: string, promptTemplate?: string): string {
  const languageName = getLanguageName(locale)

  if (category) {
    return `Return a short blessing for the theme "${category}" using code ${code}.
Keep it non-denominational, uplifting, and safe for all audiences.
Write the blessing in ${languageName}.`
  }

  const template = promptTemplate ||
    `Return a short, warm blessing (2–3 sentences) personalized by this code: {code}.
Keep it non-denominational, uplifting, and safe for all audiences.`

  return `${template.replace('{code}', code)}\nWrite the blessing in ${languageName}.`
}

function getFallbackBlessing(locale: Locale): string {
  const fallbacks: Record<Locale, string> = {
    en: 'May your day be light, your steps steady, and your heart at ease.',
    es: 'Que tu dia sea ligero, tus pasos firmes y tu corazon en calma.',
    it: 'Che la tua giornata sia leggera, i tuoi passi sicuri e il tuo cuore sereno.',
    de: 'Moge dein Tag leicht sein, deine Schritte sicher und dein Herz ruhig.',
    fr: 'Que ta journee soit legere, tes pas assures et ton coeur en paix.'
  }

  return fallbacks[locale]
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
    const ip = getClientIp(req)
    const limit = applyRateLimit({
      key: `blessing:${ip}`,
      limit: 30,
      windowMs: 60_000,
      blockMs: 5 * 60_000
    })

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many blessing requests. Please wait a few minutes and try again.'
        },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) }
        }
      )
    }

    const json = await req.json()
    const { code, category, daily, sessionId, locale = defaultLocale } = bodySchema.parse(json)
    const todayCode = new Date().toISOString().slice(0, 10)
    const resolvedCode = daily ? todayCode : code!

    const specialBlessing = !daily
      ? specialBlessingsByLocale[locale][resolvedCode] || await getDynamicSpecialBlessing(resolvedCode)
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
    const prompt = buildPrompt(resolvedCode, locale, category, promptTemplate)

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    })

    const text = completion.choices[0]?.message?.content?.trim() || getFallbackBlessing(locale)

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
