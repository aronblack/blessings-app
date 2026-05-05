'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ShareButtons from '@/components/ShareButtons'
import NoSSR from '@/components/NoSSR'

const cardBackgrounds = [
  { id: 'heaven',  label: 'Heaven',    src: '/heaven1.png' },
  { id: 'forest',  label: 'Forest',    src: '/forest.png' },
  { id: 'ocean',   label: 'Ocean',     src: '/ocean.png' },
  { id: 'stars',   label: 'Stars',     src: '/nightscape.png' },
  { id: 'hell',    label: 'Hellscape', src: '/hell-bkgrnd.png' },
  { id: 'sacred',  label: 'Sacred',    src: '/sacred-geometry.png' },
  { id: 'minimal', label: 'Minimal',   src: '/black-white.png' },
] as const

interface Props {
  blessing: string
  defaultBg: string
}

function BlessingCardClient({ blessing, defaultBg }: Props) {
  const [cardBg, setCardBg] = useState(defaultBg)

  return (
    <div className='space-y-3'>
      {/* Background picker */}
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

      {/* Card */}
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
              em: ({ children }) => <em className='italic text-white/90'>{children}</em>,
            }}
          >
            {blessing}
          </ReactMarkdown>
        </div>
        <div className='relative z-10 px-8 pb-6'>
          <NoSSR>
            <ShareButtons blessing={blessing} cardBg={cardBg} />
          </NoSSR>
        </div>
      </div>
    </div>
  )
}

// ── Share link sub-component ──────────────────────────────────────────────────
function ShareLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = `${window.location.origin}/blessing/${code}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <NoSSR>
      <button
        onClick={handleCopy}
        className='inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all shadow-md text-sm font-medium'
      >
        {copied ? (
          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><polyline points='20 6 9 17 4 12'/></svg>
        ) : (
          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'/><polyline points='16 6 12 2 8 6'/><line x1='12' y1='2' x2='12' y2='15'/></svg>
        )}
        {copied ? 'Link copied!' : `Copy link to /blessing/${code}`}
      </button>
    </NoSSR>
  )
}

BlessingCardClient.ShareLink = ShareLink

export default BlessingCardClient
