'use client'

const RainDrop = ({ delay, left, id }: { delay: number; left: string; id: number }) => {
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

export default function Rain({ showRain }: RainProps) {
  // Fixed array of raindrops - no randomness
  const rainDrops = [
    { id: 0, delay: 0.5, left: '10%' },
    { id: 1, delay: 1.2, left: '25%' },
    { id: 2, delay: 0.8, left: '40%' },
    { id: 3, delay: 1.8, left: '60%' },
    { id: 4, delay: 0.3, left: '75%' },
    { id: 5, delay: 2.1, left: '90%' },
    { id: 6, delay: 1.5, left: '15%' },
    { id: 7, delay: 0.9, left: '35%' },
    { id: 8, delay: 2.4, left: '55%' },
    { id: 9, delay: 1.1, left: '80%' },
    // Add more if needed...
  ]

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