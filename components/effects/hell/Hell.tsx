'use client'
import Image from 'next/image'

interface HellProps {
  show: boolean
  videoId?: string // can be a full YouTube URL or the 11-char ID
}

function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null
  // Accept plain ID
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input
  // Extract from common URL forms
  const m =
    input.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    input.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    input.match(/\/embed\/([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Hell({ show, videoId }: HellProps) {
  const raw = videoId || process.env.NEXT_PUBLIC_HELL_VIDEO_ID || ''
  // Fallback to a YouTube demo video that allows embedding
  const id = extractYouTubeId(raw) || 'M7lc1UVf-VE'

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'} z-[60]`}
      aria-hidden
    >
      {/* Background YouTube video */}
      <div className="absolute inset-0 -z-10 opacity-30 hell-video">
        <iframe
          title="hell-video"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&controls=0&rel=0&loop=1&playlist=${id}&modestbranding=1&playsinline=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            width: '100vw',
            height: '56.25vw', // 16:9
            minHeight: '100vh',
            minWidth: '177.78vh',
            border: 0
          }}
        />
      </div>

      {/* Devil dancer */}
      <div className="devil-drop z-20 pointer-events-none">
        <Image
          src="/devil.png"
          alt=""
          width={160}
          height={160}
          draggable={false}
        />
      </div>

      {/* Fire rising from bottom */}
      <div className="hell-fire fixed inset-x-0 bottom-0 h-[35vh]" />
    </div>
  )
}