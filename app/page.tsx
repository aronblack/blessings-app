'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Rain, TeardropSVG } from '../components/effects'
import SubscriptionForm from '../components/SubscriptionForm'
import ShareButtons from '../components/ShareButtons'

export default function Home() {
  const [code, setCode] = useState('')
  const [blessing, setBlessing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRain, setShowRain] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const hasOne = code.includes('1')
    setShowRain(hasOne)
  }, [code])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setBlessing(null)

    if (!/^\d{4}$/.test(code)) {
      setError('Please enter exactly 4 digits.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected response (${res.status})`)
      }
      
      const data: { blessing?: string; error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      
      setBlessing(data.blessing ?? null)
      // Show subscription form after receiving a blessing
      setTimeout(() => setShowSubscription(true), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
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
    <main className='min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100'>
      {/* Rain Effect - pushed further back */}
      <div className="absolute inset-0 z-0">
        <Rain showRain={showRain} />
      </div>
      
      {/* Background Teardrops - pushed much further back with lower opacity */}
      <TeardropSVG className="absolute top-20 left-20 opacity-2 rotate-12 -z-10 scale-150 blur-[1px]" fill="rgba(156, 163, 175, 0.05)" />
      <TeardropSVG className="absolute bottom-32 right-16 opacity-1 scale-75 -rotate-45 -z-10 blur-[0.5px]" fill="rgba(209, 213, 219, 0.04)" />
      <TeardropSVG className="absolute top-1/2 left-10 opacity-2 scale-110 rotate-90 -z-10 blur-[1px]" fill="rgba(243, 244, 246, 0.06)" />
      <TeardropSVG className="absolute top-1/3 right-1/3 opacity-1 scale-80 -rotate-12 -z-10 blur-[0.5px]" fill="rgba(156, 163, 175, 0.03)" />
      
      {/* Floating form container */}
      <div className='w-full max-w-md space-y-6 relative z-30 transform hover:scale-[1.01] transition-transform duration-300'>
        <h1 className='text-3xl font-light text-center text-gray-800 tracking-wide mb-8'>Receive a Blessing</h1>
        
        {/* Main form with enhanced floating effect */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={onSubmit} className='space-y-4'>
            <input
              inputMode='numeric'
              pattern='\d{4}'
              maxLength={4}
              value={code}
              onChange={e => {
                const newCode = e.target.value.replace(/\D/g, '').slice(0, 4)
                setCode(newCode)
              }}
              placeholder='Enter 4-digit code'
              className='w-full rounded-xl border border-gray-200/50 px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 transition-all text-gray-700 placeholder:text-gray-400 shadow-sm'
            />
            <button
              type='submit'
              disabled={loading}
              className='w-full rounded-xl bg-gray-800 text-white py-3 font-medium disabled:opacity-60 hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
            >
              {loading ? 'Receiving Blessing...' : 'Receive Blessing'}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-600 text-sm bg-red-50/80 backdrop-blur-sm p-3 rounded-xl border border-red-100/50">
              {error}
            </div>
          )}
        </div>
        
        {/* Blessing display with floating effect and share buttons */}
        {blessing && (
          <div className='rounded-2xl border border-gray-200/30 p-6 bg-white/85 backdrop-blur-lg shadow-2xl transform transition-all duration-500 hover:shadow-3xl animate-in slide-in-from-bottom-4'>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed text-gray-800 text-base'>{children}</p>,
                strong: ({ children }) => <strong className='font-semibold text-gray-900'>{children}</strong>,
                em: ({ children }) => <em className='italic text-gray-700'>{children}</em>,
              }}
            >
              {blessing}
            </ReactMarkdown>
            
            {/* Remove the url prop - let ShareButtons handle it internally */}
            <ShareButtons blessing={blessing} />
          </div>
        )}

        {/* Subscription form with floating effect */}
        {showSubscription && !subscribed && (
          <div className="transform transition-all duration-500 animate-in slide-in-from-bottom-4">
            <SubscriptionForm onSuccess={handleSubscriptionSuccess} />
          </div>
        )}

        {/* Success message with floating effect */}
        {subscribed && (
          <div className="bg-green-50/80 backdrop-blur-lg border border-green-200/50 rounded-2xl p-6 text-center shadow-xl transform transition-all duration-500 animate-in slide-in-from-bottom-4">
            <p className="text-green-800 font-medium">✓ Subscribed to daily blessings!</p>
            <p className="text-green-600 text-sm mt-1">You&apos;ll receive a blessing every day.</p>
          </div>
        )}

        {/* Subscribe link with floating effect */}
        {!showSubscription && !subscribed && blessing && (
          <div className="text-center">
            <button
              onClick={() => setShowSubscription(true)}
              className="text-gray-600 hover:text-gray-800 text-sm underline transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-white/30 backdrop-blur-sm"
            >
              Want daily blessings? Subscribe here
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
