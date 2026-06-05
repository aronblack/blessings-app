'use client'

import { useMemo, useState } from 'react'

type BlessingRow = {
  id?: string | number
  code: string
  blessing: string
  theme?: string | null
  session_id?: string | null
  created_at?: string | null
  approved?: boolean | null
  blocked?: boolean | null
}

type Summary = {
  usageCount: number
  approvedCount: number
  blockedCount: number
  mostUsedCodes: Array<{ code: string; count: number }>
}

type SpecialCode = {
  code: string
  blessing: string
  theme?: string | null
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [prompt, setPrompt] = useState('')
  const [blessings, setBlessings] = useState<BlessingRow[]>([])
  const [specialCodes, setSpecialCodes] = useState<SpecialCode[]>([])
  const [summary, setSummary] = useState<Summary>({
    usageCount: 0,
    approvedCount: 0,
    blockedCount: 0,
    mostUsedCodes: []
  })

  const [editId, setEditId] = useState<string | number | null>(null)
  const [editText, setEditText] = useState('')

  const [newCode, setNewCode] = useState('')
  const [newTheme, setNewTheme] = useState('')
  const [newSpecialBlessing, setNewSpecialBlessing] = useState('')
  const [specialMsg, setSpecialMsg] = useState('')

  const [search, setSearch] = useState('')

  const visibleBlessings = useMemo(() => {
    if (!search.trim()) return blessings
    const q = search.toLowerCase()
    return blessings.filter(item =>
      item.code.toLowerCase().includes(q) ||
      (item.theme || '').toLowerCase().includes(q) ||
      item.blessing.toLowerCase().includes(q)
    )
  }, [blessings, search])

  const authHeaders = (json = false) => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'x-admin-key': adminKey
  })

  const loadDashboard = async () => {
    if (!adminKey) return
    setDashboardLoading(true)
    setMessage('')

    try {
      const [promptRes, blessingsRes, specialRes] = await Promise.all([
        fetch('/api/admin/prompt', { headers: authHeaders() }),
        fetch('/api/admin/blessings?limit=250', { headers: authHeaders() }),
        fetch('/api/admin/special-codes', { headers: authHeaders() })
      ])

      const promptData = await promptRes.json()
      const blessingsData = await blessingsRes.json()
      const specialData = await specialRes.json()

      if (!promptRes.ok || !blessingsRes.ok || !specialRes.ok) {
        setMessage(
          promptData.error || blessingsData.error || specialData.error || 'Failed to load dashboard'
        )
        return
      }

      setPrompt(promptData.prompt || '')
      setBlessings(blessingsData.blessings || [])
      setSummary(blessingsData.summary || { usageCount: 0, approvedCount: 0, blockedCount: 0, mostUsedCodes: [] })
      setSpecialCodes(specialData.specialCodes || [])
      setMessage(blessingsData.warning || 'Dashboard loaded')
    } catch {
      setMessage('Failed to load dashboard')
    } finally {
      setDashboardLoading(false)
    }
  }

  const savePrompt = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/prompt', {
        method: 'POST',
        headers: authHeaders(true),
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

  const runBlessingAction = async (
    id: string | number,
    action: 'approve' | 'block' | 'unblock' | 'edit',
    blessingText?: string
  ) => {
    if (!adminKey) return

    try {
      const res = await fetch('/api/admin/blessings', {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify({ id, action, blessing: blessingText })
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Action failed')
        return
      }

      setMessage(data.warning || 'Updated')
      await loadDashboard()
    } catch {
      setMessage('Failed to update blessing')
    }
  }

  const saveEditedBlessing = async () => {
    if (!editId) return
    await runBlessingAction(editId, 'edit', editText)
    setEditId(null)
    setEditText('')
  }

  const createSpecialCode = async () => {
    if (!adminKey) return
    setSpecialMsg('')

    try {
      const res = await fetch('/api/admin/special-codes', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          code: newCode,
          theme: newTheme || undefined,
          blessing: newSpecialBlessing
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setSpecialMsg(data.error || 'Failed to create special code')
        return
      }

      setSpecialMsg('Special code saved')
      setNewCode('')
      setNewTheme('')
      setNewSpecialBlessing('')
      await loadDashboard()
    } catch {
      setSpecialMsg('Failed to create special code')
    }
  }

  const exportCsv = async () => {
    if (!adminKey) return

    try {
      const res = await fetch('/api/admin/export', { headers: authHeaders() })
      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || 'Failed to export CSV')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blessings-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setMessage('CSV exported')
    } catch {
      setMessage('Failed to export CSV')
    }
  }

  return (
    <main className='min-h-screen p-6 max-w-6xl mx-auto space-y-8'>
      <h1 className='text-2xl font-bold'>Admin Dashboard</h1>

      <section className='bg-white rounded-xl border p-4 space-y-3'>
        <label className='block text-sm font-medium'>Admin Key</label>
        <div className='flex gap-3'>
          <input
            type='password'
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder='Enter admin key'
            className='w-full rounded-lg border px-3 py-2'
          />
          <button
            onClick={loadDashboard}
            disabled={!adminKey || dashboardLoading}
            className='px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50'
          >
            {dashboardLoading ? 'Loading...' : 'Load Dashboard'}
          </button>
          <button
            onClick={exportCsv}
            disabled={!adminKey}
            className='px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50'
          >
            Export CSV
          </button>
        </div>
        {message && <p className='text-sm text-gray-600'>{message}</p>}
      </section>

      <section className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <div className='bg-white rounded-xl border p-4'>
          <p className='text-xs text-gray-500'>Total submissions</p>
          <p className='text-2xl font-semibold'>{summary.usageCount}</p>
        </div>
        <div className='bg-white rounded-xl border p-4'>
          <p className='text-xs text-gray-500'>Approved</p>
          <p className='text-2xl font-semibold'>{summary.approvedCount}</p>
        </div>
        <div className='bg-white rounded-xl border p-4'>
          <p className='text-xs text-gray-500'>Blocked</p>
          <p className='text-2xl font-semibold'>{summary.blockedCount}</p>
        </div>
        <div className='bg-white rounded-xl border p-4'>
          <p className='text-xs text-gray-500'>Most used code</p>
          <p className='text-2xl font-semibold'>{summary.mostUsedCodes[0]?.code || '-'}</p>
        </div>
      </section>

      <section className='bg-white rounded-xl border p-4 space-y-3'>
        <h2 className='font-semibold'>Most Used Codes</h2>
        <div className='flex flex-wrap gap-2'>
          {summary.mostUsedCodes.map(item => (
            <span key={item.code} className='px-3 py-1 rounded-full bg-gray-100 text-sm'>
              {item.code} ({item.count})
            </span>
          ))}
          {!summary.mostUsedCodes.length && <span className='text-sm text-gray-500'>No usage yet</span>}
        </div>
      </section>

      <section className='bg-white rounded-xl border p-4 space-y-3'>
        <h2 className='font-semibold'>Prompt Template</h2>
        <p className='text-xs text-gray-500'>Use {'{code}'} placeholder in your template.</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={5}
          className='w-full rounded-lg border px-3 py-2'
        />
        <button
          onClick={savePrompt}
          disabled={loading || !adminKey || !prompt}
          className='px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50'
        >
          {loading ? 'Saving...' : 'Save Prompt'}
        </button>
      </section>

      <section className='bg-white rounded-xl border p-4 space-y-3'>
        <h2 className='font-semibold'>Create Special Code</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={newCode}
            onChange={e => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder='4-digit code'
            className='rounded-lg border px-3 py-2'
          />
          <input
            value={newTheme}
            onChange={e => setNewTheme(e.target.value)}
            placeholder='Theme (optional)'
            className='rounded-lg border px-3 py-2'
          />
          <button
            onClick={createSpecialCode}
            disabled={!adminKey || !newCode || !newSpecialBlessing}
            className='px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50'
          >
            Save Special Code
          </button>
        </div>
        <textarea
          value={newSpecialBlessing}
          onChange={e => setNewSpecialBlessing(e.target.value)}
          rows={3}
          className='w-full rounded-lg border px-3 py-2'
          placeholder='Blessing text for this code'
        />
        {specialMsg && <p className='text-sm text-gray-600'>{specialMsg}</p>}
        <div className='space-y-2'>
          <p className='text-xs text-gray-500'>Current active special codes</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {specialCodes.map(item => (
              <div key={item.code} className='border rounded-lg p-3 text-sm'>
                <p className='font-mono font-semibold'>{item.code}</p>
                {item.theme && <p className='text-gray-500'>Theme: {item.theme}</p>}
                <p className='text-gray-700 mt-1'>{item.blessing}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white rounded-xl border p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold'>Blessings Queue</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search code/theme/text'
            className='rounded-lg border px-3 py-2 text-sm w-64'
          />
        </div>

        <div className='space-y-3 max-h-[70vh] overflow-auto pr-1'>
          {visibleBlessings.map(row => {
            const isEditing = editId === row.id
            return (
              <article key={`${row.id}-${row.created_at}`} className='border rounded-lg p-3 space-y-2'>
                <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                  <span className='font-mono text-gray-900'>{row.code}</span>
                  {row.theme && <span>theme: {row.theme}</span>}
                  {row.created_at && <span>{new Date(row.created_at).toLocaleString()}</span>}
                  {row.approved && <span className='px-2 py-0.5 rounded bg-green-100 text-green-700'>approved</span>}
                  {row.blocked && <span className='px-2 py-0.5 rounded bg-red-100 text-red-700'>blocked</span>}
                  {row.session_id && <span className='truncate'>session: {row.session_id}</span>}
                </div>

                {!isEditing ? (
                  <p className='text-sm text-gray-800 whitespace-pre-wrap'>{row.blessing}</p>
                ) : (
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={4}
                    className='w-full rounded-lg border px-3 py-2 text-sm'
                  />
                )}

                <div className='flex flex-wrap gap-2'>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditId(row.id ?? null)
                        setEditText(row.blessing)
                      }}
                      className='px-3 py-1.5 bg-gray-100 rounded text-sm'
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveEditedBlessing}
                        className='px-3 py-1.5 bg-black text-white rounded text-sm'
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null)
                          setEditText('')
                        }}
                        className='px-3 py-1.5 bg-gray-100 rounded text-sm'
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {row.id !== undefined && (
                    <>
                      <button
                        onClick={() => runBlessingAction(row.id as string | number, 'approve')}
                        className='px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm'
                      >
                        Approve
                      </button>
                      {!row.blocked ? (
                        <button
                          onClick={() => runBlessingAction(row.id as string | number, 'block')}
                          className='px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm'
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => runBlessingAction(row.id as string | number, 'unblock')}
                          className='px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded text-sm'
                        >
                          Unblock
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>
            )
          })}

          {!visibleBlessings.length && (
            <p className='text-sm text-gray-500'>No blessings found.</p>
          )}
        </div>
      </section>
    </main>
  )
}