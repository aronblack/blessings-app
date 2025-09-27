interface TeardropSVGProps {
  className?: string
  fill?: string
}

export default function TeardropSVG({ 
  className = "", 
  fill = "rgba(59, 130, 246, 0.15)" 
}: TeardropSVGProps) {
  return (
    <svg className={className} width="200" height="280" viewBox="0 0 30 42">
      <path 
        fill={fill} 
        stroke="transparent" 
        d="M15 3
           Q16.5 6.8 25 18
           A12.8 12.8 0 1 1 5 18
           Q13.5 6.8 15 3z" 
      />
    </svg>
  )
}