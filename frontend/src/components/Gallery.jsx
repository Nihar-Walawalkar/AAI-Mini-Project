export default function Gallery({ result, activeView }) {
  if (!result) {
    return (
      <section className="glass rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-white">Results</h2>
        <p className="mt-3 text-sm text-slate-400">Your processed images will appear here.</p>
      </section>
    )
  }

  const cards = [
    { title: 'Original', src: result.images.original },
    { title: 'Bicubic', src: result.images.bicubic },
    { title: 'Model SR', src: result.images.sr },
    { title: 'Enhanced', src: result.images.enhanced },
  ]

  const highlight = result.images[activeView]

  return (
    <section className="glass rounded-3xl p-6 shadow-soft">
      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          <img src={highlight} alt="highlight" className="w-full object-contain" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {cards.filter(c => c.src).map((card) => (
            <div key={card.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="border-b border-white/10 px-4 py-3 text-sm font-medium text-white">{card.title}</div>
              <img src={card.src} alt={card.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
