import { Clock3, Cpu, WandSparkles } from 'lucide-react'

export default function StatsPanel({ result }) {
  if (!result) {
    return (
      <section className="glass rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-white">Session stats</h2>
        <p className="mt-3 text-sm text-slate-400">Run the model to view inference info and enhancement details.</p>
      </section>
    )
  }

  return (
    <section className="glass rounded-3xl p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-white">Session stats</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Clock3 className="mb-2 h-5 w-5 text-cyan" />
          <div className="text-sm text-slate-400">Inference time</div>
          <div className="mt-1 text-xl font-bold text-white">{result.inferenceMs} ms</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Cpu className="mb-2 h-5 w-5 text-glow" />
          <div className="text-sm text-slate-400">Model</div>
          <div className="mt-1 text-xl font-bold text-white">{result.notes.model}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <WandSparkles className="mb-2 h-5 w-5 text-cyan" />
          <div className="text-sm text-slate-400">Display pass</div>
          <div className="mt-1 text-sm font-semibold text-white">{result.notes.displayEnhancement}</div>
        </div>
      </div>
    </section>
  )
}
