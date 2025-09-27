'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Rain, TeardropSVG } from '../components/effects'

export default function Home() {
  const [code, setCode] = useState('')
  const [blessing, setBlessing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRain, setShowRain] = useState(false)

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100'>
      {/* Rain Effect */}
      <Rain showRain={showRain} />
      
      {/* Background Teardrops - Minimal gray tones */}
      <TeardropSVG className="absolute top-20 left-20 opacity-5 rotate-12 z-1" fill="rgba(156, 163, 175, 0.1)" />
      <TeardropSVG className="absolute bottom-32 right-16 opacity-3 scale-50 -rotate-45" fill="rgba(209, 213, 219, 0.08)" />
      <TeardropSVG className="absolute top-1/2 left-10 opacity-4 scale-75 rotate-90" fill="rgba(243, 244, 246, 0.12)" />
      <TeardropSVG className="absolute top-1/3 right-1/3 opacity-3 scale-60 -rotate-12" fill="rgba(156, 163, 175, 0.06)" />
      
      <div className='w-full max-w-md space-y-6 relative z-20'>
        <h1 className='text-3xl font-light text-center text-gray-800 tracking-wide'>Receive a Blessing</h1>
        
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
            className='w-full rounded-lg border border-gray-200 px-4 py-3 bg-white/90 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder:text-gray-400'
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-gray-800 text-white py-3 font-medium disabled:opacity-60 hover:bg-gray-700 transition-all shadow-md hover:shadow-lg'
          >
            {loading ? 'Receiving Blessing...' : 'Receive Blessing'}
          </button>
        </form>

        {error && <p className='text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100'>{error}</p>}
        
        {blessing && (
          <div className='rounded-lg border border-gray-200 p-6 bg-white/95 backdrop-blur-sm shadow-lg'>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed text-gray-800 text-base'>{children}</p>,
                strong: ({ children }) => <strong className='font-semibold text-gray-900'>{children}</strong>,
                em: ({ children }) => <em className='italic text-gray-700'>{children}</em>,
              }}
            >
              {blessing}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  )
}
