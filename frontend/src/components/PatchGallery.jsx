export default function PatchGallery({ patches }) {
  if (!patches || patches.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
        Precision Drill-Down (Zoom Patches)
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {patches.map((src, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-cyan/30">
            <div className="absolute top-3 left-3 z-10 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan backdrop-blur-md">
              Sector {(i+1).toString().padStart(2, '0')}
            </div>
            <img 
              src={src} 
              alt={`Patch ${i}`} 
              className="aspect-square w-full object-cover transition duration-500 group-hover:scale-110" 
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400 italic">
        * These patches are extracted directly from the reconstructed SR output to verify per-pixel accuracy.
      </p>
    </div>
  )
}
