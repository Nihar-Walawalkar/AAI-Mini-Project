const tabs = [
  { key: 'bicubic', label: 'Bicubic baseline' },
  { key: 'sr', label: 'Model SR' },
  { key: 'enhanced', label: 'Enhanced output' },
  { key: 'edges', label: 'Edge analysis' },
]

export default function ResultTabs({ active, setActive }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActive(tab.key)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            active === tab.key
              ? 'bg-white text-ink'
              : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
