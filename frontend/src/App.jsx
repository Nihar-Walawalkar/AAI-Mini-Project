import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import StatsPanel from './components/StatsPanel'
import ResultTabs from './components/ResultTabs'
import CompareSlider from './components/CompareSlider'
import Gallery from './components/Gallery'
import MagicMagnifier from './components/MagicMagnifier'
import PatchGallery from './components/PatchGallery'
import { superResolve } from './lib/api'
import { Download } from 'lucide-react'

export default function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [enhance, setEnhance] = useState(true)
  const [deblock, setDeblock] = useState(false)
  const [sharpenStrength, setSharpenStrength] = useState(1.3)
  const [activeView, setActiveView] = useState('enhanced')
  const [lensMode, setLensMode] = useState(false)

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  async function handleRun() {
    if (!file) return
    try {
      setLoading(true)
      setError('')
      const data = await superResolve({ file, enhance, sharpenStrength, deblock })
      setResult(data)
      setActiveView(enhance ? 'enhanced' : 'sr')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function downloadReport() {
    if (!result) return
    const link = document.createElement('a')
    link.href = result.images.enhanced
    link.download = `SR_Report_${result.jobId || 'analysis'}.png`
    link.click()
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
            deblock={deblock}
            setDeblock={setDeblock}
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
                <h2 className="text-xl font-semibold text-white">Precision work-bench</h2>
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => setLensMode(!lensMode)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {lensMode ? 'Switch to Slider' : 'Use Magic Magnifier'}
                  </button>
                  {result && (
                    <button 
                      onClick={downloadReport}
                      className="flex items-center gap-2 rounded-full bg-cyan/15 px-3 py-1 text-xs font-semibold text-cyan transition hover:bg-cyan/30"
                    >
                      <Download className="h-3 w-3" />
                      Export Report
                    </button>
                  )}
                </div>
              </div>
              <ResultTabs active={activeView} setActive={setActiveView} />
            </div>

            {result ? (
              <div className="mt-6">
                {lensMode ? (
                  <MagicMagnifier
                    leftImage={result.images.bicubic}
                    rightImage={result.images[activeView]}
                    leftLabel="Bicubic"
                    rightLabel={activeView === 'enhanced' ? 'Enhanced' : activeView === 'sr' ? 'Model SR' : activeView === 'edges' ? 'Structure' : 'Bicubic'}
                  />
                ) : (
                  <CompareSlider
                    leftImage={result.images.bicubic}
                    rightImage={result.images[activeView]}
                    leftLabel="Bicubic"
                    rightLabel={activeView === 'enhanced' ? 'Enhanced' : activeView === 'sr' ? 'Model SR' : activeView === 'edges' ? 'Structure' : 'Bicubic'}
                  />
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-slate-400">
                Upload an image and run the model to begin analysis.
              </div>
            )}
          </div>

          <PatchGallery patches={result?.patches} />

          <Gallery result={result} activeView={activeView} />
        </div>
      </main>
    </div>
  )
}
