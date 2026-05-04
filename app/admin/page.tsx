'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [prompt, setPrompt] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // NEW: Hell video state
  const [videoId, setVideoId] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoMsg, setVideoMsg] = useState('')

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

  // NEW: load current Hell video ID
  const loadVideo = async () => {
    if (!adminKey) return
    setVideoMsg('')
    try {
      const res = await fetch('/api/hell-video', {
        headers: { 'x-admin-key': adminKey }
      })
      const data = await res.json()
      if (res.ok) {
        setVideoId(data.hellVideoId || '')
        setVideoMsg('Loaded current video ID')
      } else {
        setVideoMsg(data.error || 'Failed to load')
      }
    } catch {
      setVideoMsg('Failed to load')
    }
  }

  // NEW: save Hell video ID
  const saveVideo = async () => {
    if (!adminKey || !videoId) return
    setVideoLoading(true)
    setVideoMsg('')
    try {
      const res = await fetch('/api/hell-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ videoId })
      })
      const data = await res.json()
      if (res.ok) {
        setVideoId(data.hellVideoId)
        setVideoMsg('Saved video ID')
      } else {
        setVideoMsg(data.error || 'Failed to save')
      }
    } catch {
      setVideoMsg('Failed to save')
    } finally {
      setVideoLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin - Manage Settings</h1>
      
      <div className="space-y-8">
        {/* Admin key */}
        <div>
          <label className="block text-sm font-medium mb-2">Admin Key</label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Prompt controls */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={loadPrompt}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg"
              disabled={!adminKey}
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
        </section>

        {/* NEW: Hell Video controls */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={loadVideo}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg"
              disabled={!adminKey}
            >
              Load Current Hell Video
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hell Video (YouTube URL or 11-char ID)
            </label>
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="https://youtu.be/xxxxxxxxxxx or ID"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            onClick={saveVideo}
            disabled={videoLoading || !adminKey || !videoId}
            className="w-full bg-gray-800 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {videoLoading ? 'Saving...' : 'Save Hell Video'}
          </button>

          {videoMsg && (
            <p className="text-sm text-gray-600">{videoMsg}</p>
          )}
        </section>
      </div>
    </main>
  )
}