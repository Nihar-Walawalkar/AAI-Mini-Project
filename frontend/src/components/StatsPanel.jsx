import { Clock3, Cpu, WandSparkles, Binary, ChartSpline } from 'lucide-react'

export default function StatsPanel({ result }) {
  if (!result) {
    return (
      <section className="glass rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-white">Precision stats</h2>
        <p className="mt-3 text-sm text-slate-400">Scientific metrics will appear here after processing.</p>
      </section>
    )
  }

  return (
    <section className="glass rounded-3xl p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-white">Analysis details</h2>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Clock3 className="mb-2 h-5 w-5 text-cyan" />
          <div className="text-sm text-slate-400">Inference</div>
          <div className="mt-1 text-xl font-bold text-white">{result.inferenceMs} ms</div>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Binary className="mb-2 h-5 w-5 text-glow" />
          <div className="text-sm text-slate-400">PSNR Accuracy</div>
          <div className="mt-1 text-xl font-bold text-white">{result.metrics?.psnr} dB</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <ChartSpline className="mb-2 h-5 w-5 text-cyan" />
          <div className="text-sm text-slate-400">SSIM (Structure)</div>
          <div className="mt-1 text-xl font-bold text-white">{(result.metrics?.ssim * 100).toFixed(2)}%</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <WandSparkles className="mb-2 h-5 w-5 text-glow" />
          <div className="text-sm text-slate-400">Restoration Pass</div>
          <div className="mt-1 text-xs font-semibold text-white leading-tight">{result.notes.displayEnhancement}</div>
        </div>
      </div>
    </section>
  )
}
