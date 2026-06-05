'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import NoSSR from '@/components/NoSSR'
import { Rain, TeardropSVG, Hell } from '@/components/effects'
import SubscriptionForm from '@/components/SubscriptionForm'
import ShareButtons from '@/components/ShareButtons'
import {
  getLocalizedBlessingCategories,
  getLocalizedCardBackgrounds,
  shareText,
  subscriptionText,
  type Locale,
  uiText
} from '@/lib/i18n'

interface Props {
  locale: Locale
}

export default function HomePage({ locale }: Props) {
  const labels = uiText[locale]
  const categories = getLocalizedBlessingCategories(locale)
  const cardBackgrounds = getLocalizedCardBackgrounds(locale)

  const [code, setCode] = useState('')
  const [category, setCategory] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [cardBg, setCardBg] = useState<typeof cardBackgrounds[number]['src']>('/heaven1.png')
  const [blessing, setBlessing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRain, setShowRain] = useState(false)
  const [showHell, setShowHell] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setShowRain(code.includes('1'))
    setShowHell(code.includes('666'))
  }, [code])

  useEffect(() => {
    const key = 'blessing_session_id'
    const existing = window.localStorage.getItem(key)
    if (existing) {
      setSessionId(existing)
      return
    }

    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess-${Math.random().toString(36).slice(2)}-${Date.now()}`

    window.localStorage.setItem(key, generated)
    setSessionId(generated)
  }, [])

  const requestBlessing = async (payload: {
    code?: string
    category?: string
    daily?: boolean
    sessionId?: string
  }) => {
    const res = await fetch('/api/blessing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, locale })
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected response (${res.status})`)
    }

    const data: { blessing?: string; error?: string } = await res.json()
    if (!res.ok) throw new Error(data.error || labels.genericError)

    setBlessing(data.blessing ?? null)
    setTimeout(() => setShowSubscription(true), 3000)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setBlessing(null)

    if (!/^\d{4}$/.test(code)) {
      setError(labels.codeValidationError)
      return
    }

    setLoading(true)
    try {
      await requestBlessing({
        code,
        category: category || undefined,
        sessionId: sessionId || undefined
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : labels.genericError
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onDailyBlessing = async () => {
    setError(null)
    setBlessing(null)
    setLoading(true)

    try {
      await requestBlessing({
        daily: true,
        category: category || undefined,
        sessionId: sessionId || undefined
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : labels.genericError
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionSuccess = () => {
    setSubscribed(true)
    setShowSubscription(false)
  }

  return (
    <main className='min-h-dvh flex items-center justify-center p-6 relative overflow-hidden'>
      <NoSSR fallback={null}>
        <Hell show={showHell} />
      </NoSSR>

      <NoSSR fallback={<div className='fixed inset-0 pointer-events-none overflow-hidden z-0' />}>
        <Rain showRain={showRain} />
      </NoSSR>

      <TeardropSVG className='absolute top-20 left-20 opacity-2 rotate-12 -z-10 scale-150 blur-[1px]' fill='rgba(156, 163, 175, 0.05)' />
      <TeardropSVG className='absolute bottom-32 right-16 opacity-1 scale-75 -rotate-45 -z-10 blur-[0.5px]' fill='rgba(209, 213, 219, 0.04)' />
      <TeardropSVG className='absolute top-1/2 left-10 opacity-2 scale-110 rotate-90 -z-10 blur-[1px]' fill='rgba(243, 244, 246, 0.06)' />
      <TeardropSVG className='absolute top-1/3 right-1/3 opacity-1 scale-80 -rotate-12 -z-10 blur-[0.5px]' fill='rgba(156, 163, 175, 0.03)' />

      <div className='w-full max-w-md space-y-6 relative z-30 transform hover:scale-[1.01] transition-transform duration-300'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/gates2.png' alt={labels.gatesAlt} className='mx-auto mb-[3px]' />

        <div className='relative group'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/angel-wing.png'
            alt=''
            className='pointer-events-none absolute left-0 top-1/2 z-[1] hidden w-96 -translate-x-[calc(70%+6px)] -translate-y-1/2 opacity-90 transition-all duration-300 drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] [filter:sepia(0.18)_saturate(1.15)_brightness(1.08)] md:block'
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/angel-wing.png'
            alt=''
            className='pointer-events-none absolute right-0 top-1/2 z-[1] hidden w-96 translate-x-[calc(70%+6px)] -translate-y-1/2 scale-x-[-1] opacity-90 transition-all duration-300 drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] [filter:sepia(0.18)_saturate(1.15)_brightness(1.08)] md:block'
          />
          <div className='relative z-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 group-hover:shadow-3xl'>
            <form onSubmit={onSubmit} className='space-y-4'>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className='w-full rounded-xl border border-gray-200/50 px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 transition-all text-gray-700 shadow-sm'
                aria-label={labels.categoryAriaLabel}
              >
                <option value=''>{labels.categoryPlaceholder}</option>
                {categories.map(item => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input
                inputMode='numeric'
                pattern='\d{4}'
                maxLength={4}
                value={code}
                onChange={e => {
                  const newCode = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setCode(newCode)
                }}
                placeholder={labels.codePlaceholder}
                className='w-full rounded-xl border border-gray-200/50 px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 transition-all text-gray-700 placeholder:text-gray-400 shadow-sm'
              />
              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-xl bg-gray-800 text-white py-3 font-medium disabled:opacity-60 hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? labels.receivingBlessing : labels.receiveBlessing}
              </button>
              <button
                type='button'
                onClick={onDailyBlessing}
                disabled={loading}
                className='w-full rounded-xl bg-white text-gray-800 py-3 font-medium border border-gray-200 disabled:opacity-60 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? labels.receivingBlessing : labels.todaysBlessing}
              </button>
            </form>

            {error && (
              <div className='mt-4 text-red-600 text-sm bg-red-50/80 backdrop-blur-sm p-3 rounded-xl border border-red-100/50'>
                {error}
              </div>
            )}
          </div>
        </div>

        {blessing && (
          <div className='space-y-3 animate-in slide-in-from-bottom-4 duration-500'>
            <div className='flex gap-2 justify-center flex-wrap'>
              {cardBackgrounds.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setCardBg(bg.src)}
                  title={bg.label}
                  className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${
                    cardBg === bg.src ? 'border-gray-800 shadow-lg scale-110' : 'border-transparent'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bg.src} alt={bg.label} className='w-full h-full object-cover' />
                </button>
              ))}
            </div>

            <div
              className='relative rounded-2xl overflow-hidden shadow-2xl min-h-[220px] flex flex-col justify-center'
              style={{ backgroundImage: `url(${cardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className='absolute inset-0 bg-black/50 backdrop-blur-[2px]' />
              <div className='relative z-10 p-8'>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed text-white text-base drop-shadow-md'>{children}</p>,
                    strong: ({ children }) => <strong className='font-semibold text-white'>{children}</strong>,
                    em: ({ children }) => <em className='italic text-white/90'>{children}</em>
                  }}
                >
                  {blessing}
                </ReactMarkdown>
              </div>
              <div className='relative z-10 px-8 pb-6'>
                <NoSSR>
                  <ShareButtons blessing={blessing} cardBg={cardBg} locale={locale} labels={shareText[locale]} />
                </NoSSR>
              </div>
            </div>
          </div>
        )}

        {showSubscription && !subscribed && (
          <div className='transform transition-all duration-500 animate-in slide-in-from-bottom-4'>
            <SubscriptionForm onSuccess={handleSubscriptionSuccess} labels={subscriptionText[locale]} genericError={labels.genericError} />
          </div>
        )}

        {subscribed && (
          <div className='bg-green-50/80 backdrop-blur-lg border border-green-200/50 rounded-2xl p-6 text-center shadow-xl transform transition-all duration-500 animate-in slide-in-from-bottom-4'>
            <p className='text-green-800 font-medium'>✓ {labels.subscribedTitle}</p>
            <p className='text-green-600 text-sm mt-1'>{labels.subscribedBody}</p>
          </div>
        )}

        {!showSubscription && !subscribed && blessing && (
          <div className='text-center'>
            <button
              onClick={() => setShowSubscription(true)}
              className='text-gray-600 hover:text-gray-800 text-sm underline transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-white/30 backdrop-blur-sm'
            >
              {labels.wantDailyBlessings}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
