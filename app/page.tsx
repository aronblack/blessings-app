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
    <main className='min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Rain Effect */}
      <Rain showRain={showRain} />
      
      {/* Background Teardrops */}
      <TeardropSVG className="absolute top-20 left-20 opacity-10 rotate-12 z-1" />
      <TeardropSVG className="absolute bottom-32 right-16 opacity-5 scale-50 -rotate-45" fill="rgba(99, 102, 241, 0.1)" />
      <TeardropSVG className="absolute top-1/2 left-10 opacity-8 scale-75 rotate-90" fill="rgba(139, 92, 246, 0.08)" />
      <TeardropSVG className="absolute top-1/3 right-1/3 opacity-5 scale-60 -rotate-12" fill="rgba(59, 130, 246, 0.12)" />
      
      <div className='w-full max-w-md space-y-4 relative z-20'>
        <h1 className='text-2xl font-semibold text-center'>Receive a Blessing</h1>
        
        <form onSubmit={onSubmit} className='space-y-3'>
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
            className='w-full rounded-lg border px-3 py-2 bg-white/80 backdrop-blur-sm'
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-black text-white py-2 disabled:opacity-60 hover:bg-gray-800 transition-colors'
          >
            {loading ? 'Blessing…' : 'Get Blessing'}
          </button>
        </form>

        {error && <p className='text-red-600 text-sm'>{error}</p>}
        
        {blessing && (
          <div className='prose prose-sm max-w-none text-gray-800 rounded-lg border p-4 bg-white/90 backdrop-blur-sm shadow-sm'>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-2 last:mb-0 leading-relaxed'>{children}</p>,
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
