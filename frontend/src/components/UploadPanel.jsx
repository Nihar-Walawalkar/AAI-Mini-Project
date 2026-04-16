import { ImageUp, LoaderCircle } from 'lucide-react'

export default function UploadPanel({
  preview,
  file,
  onFile,
  onRun,
  loading,
  enhance,
  setEnhance,
  sharpenStrength,
  setSharpenStrength,
}) {
  return (
    <section className="glass rounded-3xl p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Upload & controls</h2>
          <p className="text-sm text-slate-300">Use a clean photo with visible details for the best demo impact.</p>
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center transition hover:bg-white/10">
        <ImageUp className="mb-3 h-10 w-10 text-cyan" />
        <div className="font-medium text-white">Drag and drop or click to upload</div>
        <div className="mt-1 text-sm text-slate-400">JPG, PNG, WEBP</div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>

      {preview && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <img src={preview} alt="preview" className="max-h-72 w-full object-contain" />
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-white">Display enhancement</div>
              <div className="text-sm text-slate-400">Post-processing after model inference</div>
            </div>
            <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} />
          </div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Sharpen strength</span>
            <span>{sharpenStrength.toFixed(1)}x</span>
          </div>
          <input
            className="range-thumb mt-3 w-full"
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={sharpenStrength}
            onChange={(e) => setSharpenStrength(Number(e.target.value))}
          />
        </label>
      </div>

      <button
        onClick={onRun}
        disabled={!file || loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-glow to-cyan px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
        {loading ? 'Processing...' : 'Run super-resolution'}
      </button>
    </section>
  )
}
