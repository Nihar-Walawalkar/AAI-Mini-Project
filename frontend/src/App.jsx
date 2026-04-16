import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import StatsPanel from './components/StatsPanel'
import ResultTabs from './components/ResultTabs'
import CompareSlider from './components/CompareSlider'
import Gallery from './components/Gallery'
import { superResolve } from './lib/api'

export default function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [enhance, setEnhance] = useState(true)
  const [sharpenStrength, setSharpenStrength] = useState(1.3)
  const [activeView, setActiveView] = useState('enhanced')

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  async function handleRun() {
    if (!file) return
    try {
      setLoading(true)
      setError('')
      const data = await superResolve({ file, enhance, sharpenStrength })
      setResult(data)
      setActiveView(enhance ? 'enhanced' : 'sr')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.24),transparent_28%),radial-gradient(circle_at_right,rgba(34,211,238,0.16),transparent_22%),#0b1020] bg-grid bg-[length:26px_26px]">
      <Header />

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[420px,1fr]">
        <div className="space-y-6">
          <UploadPanel
            preview={preview}
            file={file}
            onFile={setFile}
            onRun={handleRun}
            loading={loading}
            enhance={enhance}
            setEnhance={setEnhance}
            sharpenStrength={sharpenStrength}
            setSharpenStrength={setSharpenStrength}
          />
          <StatsPanel result={result} />
        </div>

        <div className="space-y-6">
          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-4 text-rose-200 shadow-soft">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          ) : null}

          <div className="glass rounded-3xl p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Comparison workspace</h2>
                <p className="text-sm text-slate-400">Use the tabs and slider to show the improvement clearly during your demo.</p>
              </div>
              <ResultTabs active={activeView} setActive={setActiveView} />
            </div>

            {result ? (
              <div className="mt-6">
                <CompareSlider
                  leftImage={result.images.bicubic}
                  rightImage={result.images[activeView]}
                  leftLabel="Bicubic"
                  rightLabel={activeView === 'enhanced' ? 'Enhanced output' : activeView === 'sr' ? 'Model SR' : 'Bicubic'}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-slate-400">
                Upload an image and run the model to populate this workspace.
              </div>
            )}
          </div>

          <Gallery result={result} activeView={activeView} />

          <div className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-white">Presentation notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Show Bicubic vs Model SR first. Then toggle the enhanced output as an extra display pass.</li>
              <li>Use sharp images with visible textures, fabric, hair, architecture, or edges for a stronger demo.</li>
              <li>Do not claim the enhancement is learned by the model. Present it as a post-processing display option.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
