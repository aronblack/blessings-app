'use client'

import { useState } from 'react'
import { type Locale, subscriptionText } from '@/lib/i18n'

interface SubscriptionFormProps {
  onSuccess: () => void
  labels?: (typeof subscriptionText)[Locale]
  genericError?: string
}

export default function SubscriptionForm({ onSuccess, labels = subscriptionText.en, genericError = 'Something went wrong' }: SubscriptionFormProps) {
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile, website })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || labels.subscribeFailed)

      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : genericError
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
      <h2 className="text-xl font-light text-gray-800 mb-4 text-center">
        {labels.title}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white/90 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder:text-gray-400"
        />
        
        <input
          type="tel"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          placeholder={labels.mobilePlaceholder}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white/90 backdrop-blur-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder:text-gray-400"
        />

        <input
          type='text'
          value={website}
          onChange={e => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete='off'
          className='hidden'
          aria-hidden='true'
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-800 text-white py-3 font-medium disabled:opacity-60 hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
        >
          {loading ? labels.subscribing : labels.subscribe}
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 mt-4">
          {error}
        </p>
      )}
    </div>
  )
}