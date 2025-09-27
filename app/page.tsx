'use client'

import { useState } from 'react'

export default function Home() {
  const [code, setCode] = useState('')
  const [blessing, setBlessing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setBlessing(data.blessing)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-dvh flex items-center justify-center p-6'>
      <div className='w-full max-w-md space-y-4'>
        <h1 className='text-2xl font-semibold'>Receive a Blessing</h1>
        <form onSubmit={onSubmit} className='space-y-3'>
          <input
            inputMode='numeric'
            pattern='\d{4}'
            maxLength={4}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder='Enter 4-digit code'
            className='w-full rounded-lg border px-3 py-2'
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-black text-white py-2 disabled:opacity-60'
          >
            {loading ? 'Blessing…' : 'Get Blessing'}
          </button>
        </form>

        {error && <p className='text-red-600'>{error}</p>}
        {blessing && (
          <div className='rounded-lg border p-3'>
            <p className='whitespace-pre-wrap'>{blessing}</p>
          </div>
        )}
      </div>
    </main>
  )
}
