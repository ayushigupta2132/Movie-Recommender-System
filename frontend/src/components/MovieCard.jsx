/**
 * MovieCard.jsx
 * -------------
 * Displays a single recommended movie.
 *
 * Props:
 *   movie: {
 *     movie_id:   number
 *     title:      string
 *     score:      number   (cosine similarity 0.0–1.0)
 *     poster_url: string
 *   }
 *   rank: number  (1-based position, used for the rank badge)
 */
import { useState } from 'react'

export default function MovieCard({ movie, rank }) {
  // Track whether the poster image failed to load.
  // If it did, we show a styled fallback instead of a broken image icon.
  const [imgError, setImgError] = useState(false)

  // Convert cosine similarity score to a percentage string for display.
  // score is already rounded to 3 decimal places by the backend.
  const matchPercent = Math.round(movie.score * 100)

  // Score drives the badge color:
  //   >= 30% → green   (strong match)
  //   >= 15% → yellow  (decent match)
  //    < 15% → zinc    (weak match — cosine similarity on tag vectors
  //                     rarely exceeds 0.4, so these thresholds are calibrated
  //                     to the actual score distribution from this model)
  function scoreBadgeClass(pct) {
    if (pct >= 30) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (pct >= 15) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
  }

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60">

      {/* ------------------------------------------------------------------ */}
      {/* Poster                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative w-full aspect-[2/3] bg-zinc-800 overflow-hidden">

        {/* Rank badge — top-left corner */}
        <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <span className="text-xs font-bold text-white">{rank}</span>
        </div>

        {/* Score badge — top-right corner */}
        <div className={`absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md border text-xxs font-semibold backdrop-blur-sm ${scoreBadgeClass(matchPercent)}`}>
          {matchPercent}% match
        </div>

        {/* Poster image or fallback */}
        {!imgError ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // Fallback when the image URL is broken or TMDB is unreachable
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
            </svg>
            <span className="text-zinc-500 text-xs">{movie.title}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Info strip                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3
          className="text-sm font-semibold text-white leading-snug line-clamp-2"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <p className="text-zinc-500 text-xs mt-auto">
          Similarity score: {movie.score.toFixed(3)}
        </p>
      </div>

    </div>
  )
}