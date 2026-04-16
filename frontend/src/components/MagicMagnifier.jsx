import { useState, useRef } from 'react'

export default function MagicMagnifier({ leftImage, rightImage, leftLabel, rightLabel }) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPosition({ x, y })
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <span>{leftLabel}</span>
        <span className="flex items-center gap-2">
          {rightLabel} <span className="rounded bg-cyan/20 px-2 py-0.5 text-xs text-cyan">Magic Magnifier</span>
        </span>
      </div>
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image (Low Res) */}
        <img src={leftImage} alt={leftLabel} className="block w-full" />
        
        {/* Magnifier Lens (High Res) */}
        {isHovered && (
          <div 
            className="pointer-events-none absolute border-2 border-cyan/50 shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-full overflow-hidden"
            style={{
              width: '250px',
              height: '250px',
              left: `calc(${position.x}% - 125px)`,
              top: `calc(${position.y}% - 125px)`,
              // Hard drop shadow to separate lens
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4), 0 0 20px rgba(34,211,238,0.5)'
            }}
          >
            <div 
              className="absolute w-full h-full"
              style={{
                width: containerRef.current ? containerRef.current.offsetWidth + 'px' : '100%',
                height: containerRef.current ? containerRef.current.offsetHeight + 'px' : '100%',
                left: `calc(-${position.x}% * ${containerRef.current ? containerRef.current.offsetWidth/100 : 1} + 125px)`,
                top: `calc(-${position.y}% * ${containerRef.current ? containerRef.current.offsetHeight/100 : 1} + 125px)`,
              }}
            >
              <img src={rightImage} alt={rightLabel} className="absolute top-0 left-0 w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
