'use client'

import { useMemo } from 'react'

const RainDrop = ({ delay, left }: { delay: number; left: string; id: number }) => {
  return (
    <div 
      className="absolute rain-drop opacity-60 z-0"
      style={{
        left,
        animationDelay: `${delay}s`,
        animationDuration: '3s',
        animationIterationCount: 'infinite',
        top: '-20px'
      }}
    >
      <svg width="12" height="16" viewBox="0 0 30 42" className="text-blue-400">
        <path 
          fill="currentColor"
          d="M15 3
             Q16.5 6.8 25 18
             A12.8 12.8 0 1 1 5 18
             Q13.5 6.8 15 3z" 
        />
      </svg>
    </div>
  )
}

interface RainProps {
  showRain: boolean
}

// Create a seeded random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function Rain({ showRain }: RainProps) {
  // Use a consistent seed to generate the same raindrops every time
  const rainDrops = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      // Use the index as seed to get consistent values
      const delay = seededRandom(i * 100) * 3
      const left = `${seededRandom(i * 200) * 100}%`
      return {
        id: i,
        delay,
        left
      }
    })
  }, []) // Empty dependency array - only create once on mount

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-300 ${
        showRain ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {rainDrops.map(drop => (
        <RainDrop 
          key={drop.id}
          id={drop.id}
          delay={drop.delay}
          left={drop.left}
        />
      ))}
    </div>
  )
}