import { useState } from 'react'

export default function MovieCard({ movie, rank }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const matchPercent = Math.round(movie.score * 100)

  function scoreBadgeClass(pct) {
    if (pct >= 30) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (pct >= 15) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'
  }

  function scoreBarWidth(pct) {
    // Scale to visible range — cosine similarity on tag vectors
    // rarely exceeds 50%, so we map 0–50 to 0–100% bar width.
    return Math.min(Math.round((pct / 50) * 100), 100)
  }

  return (
    <article
      className="group flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60 hover:border-zinc-600 shadow-card hover:shadow-card-hover transition-all duration-250 hover:-translate-y-1.5 cursor-default"
      style={{ '--stagger': rank - 1 }}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] bg-zinc-800 overflow-hidden">

        {/* Rank badge */}
        <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/75 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <span className="text-xxs font-bold text-white/90 leading-none">{rank}</span>
        </div>

        {/* Score badge */}
        <div className={`absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md border text-xxs font-semibold backdrop-blur-sm ${scoreBadgeClass(matchPercent)}`}>
          {matchPercent}%
        </div>

        {/* Gradient overlay — fades bottom of poster into the card body */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent z-10 pointer-events-none" />

        {!imgError ? (
          <>
            {/* Shimmer while the actual image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
            )}
            <img
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4 text-center bg-zinc-800/60">
            <div className="w-12 h-12 rounded-full bg-zinc-700/60 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
              </svg>
            </div>
            <span className="text-zinc-500 text-xs leading-snug">{movie.title}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3
          className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2"
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Similarity bar */}
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xxs">Match</span>
            <span className={`text-xxs font-semibold ${scoreBadgeClass(matchPercent).split(' ')[1]}`}>
              {matchPercent}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${scoreBarWidth(matchPercent)}%` }}
              role="meter"
              aria-label={`${matchPercent}% match`}
              aria-valuenow={matchPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </article>
  )
}