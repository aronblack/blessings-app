'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [prompt, setPrompt] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadPrompt = async () => {
    if (!adminKey) return

    try {
      const res = await fetch('/api/admin/prompt', {
        headers: { 'x-admin-key': adminKey }
      })
      const data = await res.json()
      if (res.ok) {
        setPrompt(data.prompt)
      } else {
        setMessage(data.error || 'Failed to load')
      }
    } catch {
      setMessage('Failed to load prompt')
    }
  }

  const savePrompt = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/prompt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': adminKey 
        },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Prompt saved successfully!')
      } else {
        setMessage(data.error || 'Failed to save')
      }
    } catch {
      setMessage('Failed to save prompt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin - Manage Prompt</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Admin Key</label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button
            onClick={loadPrompt}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Load Current Prompt
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Prompt Template (use {'{code}'} as placeholder)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Enter your prompt template..."
          />
        </div>

        <button
          onClick={savePrompt}
          disabled={loading || !adminKey || !prompt}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Prompt'}
        </button>

        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}