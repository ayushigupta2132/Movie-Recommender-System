/**
 * MovieGrid.jsx
 * -------------
 * Renders the full recommendation results section including:
 *   - Loading state  (skeletons)
 *   - Error state    (message + retry button)
 *   - Empty state    (no results returned)
 *   - Results        (grid of MovieCards)
 *
 * Props:
 *   seedMovie:  string | null   — the movie that was searched
 *   movies:     array           — recommendation results from the API
 *   isLoading:  bool
 *   error:      string | null
 *   onRetry:    function        — called when the user clicks Retry
 */
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

const SKELETON_COUNT = 5

export default function MovieGrid({ seedMovie, movies, isLoading, error, onRetry }) {

  // Don't render anything until the user has selected a movie
  if (!seedMovie) return null

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section aria-label="Loading recommendations" aria-busy="true" className="mt-10">
        <SectionHeader seedMovie={seedMovie} subtitle="Finding similar movies…" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {[...Array(SKELETON_COUNT)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section aria-label="Recommendation error" className="mt-10">
        <SectionHeader seedMovie={seedMovie} />
        <div className="mt-6 flex flex-col items-center gap-4 py-14 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <div className="text-center">
            <p className="text-white font-medium">Something went wrong</p>
            <p className="text-zinc-400 text-sm mt-1 max-w-sm">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="mt-2 px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  // API returned 200 but with an empty recommendations array
  if (movies.length === 0) {
    return (
      <section aria-label="No recommendations" className="mt-10">
        <SectionHeader seedMovie={seedMovie} />
        <div className="mt-6 flex flex-col items-center gap-3 py-14 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-zinc-400 text-sm">No recommendations found for this movie.</p>
        </div>
      </section>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────
  return (
    <section aria-label="Recommendations" className="mt-10">
      <SectionHeader
        seedMovie={seedMovie}
        subtitle={`${movies.length} movies similar to this one`}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.movie_id}
            movie={movie}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SectionHeader — shared across all states so the layout is stable
// ---------------------------------------------------------------------------
function SectionHeader({ seedMovie, subtitle }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
      <h2 className="text-xl font-bold text-white">
        Because you searched
        <span className="text-accent"> "{seedMovie}"</span>
      </h2>
      {subtitle && (
        <span className="text-zinc-500 text-sm">{subtitle}</span>
      )}
    </div>
  )
}