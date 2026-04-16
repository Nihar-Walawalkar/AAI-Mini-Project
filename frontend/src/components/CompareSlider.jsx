import { useState } from 'react'

export default function CompareSlider({ leftImage, rightImage, leftLabel, rightLabel }) {
  const [position, setPosition] = useState(50)

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative overflow-hidden rounded-2xl">
        <img src={leftImage} alt={leftLabel} className="block w-full" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={rightImage} alt={rightLabel} className="block w-full max-w-none" />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${position}%` }}>
          <div className="h-full w-0.5 bg-white/90" />
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="range-thumb mt-4 w-full"
      />
    </div>
  )
}
