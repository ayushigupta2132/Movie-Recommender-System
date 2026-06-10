import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

const SKELETON_COUNT = 5

export default function MovieGrid({ seedMovie, movies, isLoading, error, onRetry }) {
  if (!seedMovie) return null

  if (isLoading) {
    return (
      <section aria-label="Loading recommendations" aria-busy="true" className="mt-12 animate-fade-up">
        <SectionHeader seedMovie={seedMovie} subtitle="Finding similar movies…" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
          {[...Array(SKELETON_COUNT)].map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} index={i} />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section aria-label="Recommendation error" className="mt-12 animate-fade-up">
        <SectionHeader seedMovie={seedMovie} />
        <div className="mt-6 flex flex-col items-center gap-4 py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <div className="text-center px-4">
            <p className="text-white font-semibold">Could not load recommendations</p>
            <p className="text-zinc-400 text-sm mt-1.5 max-w-sm text-balance">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="mt-1 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover active:scale-95 text-white text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (movies.length === 0) {
    return (
      <section aria-label="No recommendations" className="mt-12 animate-fade-up">
        <SectionHeader seedMovie={seedMovie} />
        <div className="mt-6 flex flex-col items-center gap-3 py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
            <svg className="w-7 h-7 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">No recommendations found for this title.</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Recommendations" className="mt-12 animate-fade-up">
      <SectionHeader
        seedMovie={seedMovie}
        subtitle={`${movies.length} similar movies`}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
        {movies.map((movie, index) => (
          <div
            key={movie.movie_id}
            className="animate-fade-up-stagger"
            style={{ '--stagger': index }}
          >
            <MovieCard movie={movie} rank={index + 1} />
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionHeader({ seedMovie, subtitle }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-zinc-800 pb-4">
      <h2 className="text-lg sm:text-xl font-bold text-white">
        Because you liked{' '}
        <span className="text-accent">"{seedMovie}"</span>
      </h2>
      {subtitle && (
        <span className="text-zinc-500 text-sm">{subtitle}</span>
      )}
    </div>
  )
}