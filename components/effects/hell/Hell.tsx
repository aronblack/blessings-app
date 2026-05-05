'use client'
import Image from 'next/image'

interface HellProps {
  show: boolean
}

export default function Hell({ show }: HellProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'} z-[60]`}
      aria-hidden
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Image
          src="/hell-bkgrnd.png"
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>


    </div>
  )
}