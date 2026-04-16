import { Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-6 pt-8"
    >
      <div className="glass rounded-3xl p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-3 text-cyan">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan/90">Advanced AI Project</span>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.5fr,1fr] md:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              SR Vision Studio
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Sleek super-resolution demo powered by an RRDBNet generator, with honest display enhancement
              and clean comparisons.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-5 w-5 text-glow" />
              <h2 className="font-semibold">Demo Flow</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Upload image → run model → compare Bicubic vs Model SR → optionally view post-processed display output.
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
