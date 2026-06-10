/**
 * Home.jsx
 * --------
 * Owns the recommendation fetch lifecycle.
 * SearchBar (Phase 2) is unchanged — it still calls onSelect with a title.
 * MovieGrid (Phase 3) consumes the result of that fetch.
 */
import { useState, useCallback } from 'react'
import SearchBar from '../components/SearchBar'
import MovieGrid from '../components/MovieGrid'
import { getRecommendations } from '../api/client'

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movies, setMovies]               = useState([])
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState(null)

  // fetchRecommendations is defined with useCallback so it can be passed
  // to MovieGrid's onRetry prop without causing unnecessary re-renders.
  const fetchRecommendations = useCallback(async (title) => {
    setSelectedMovie(title)
    setIsLoading(true)
    setError(null)
    setMovies([])

    try {
      const data = await getRecommendations(title, 5)

      // Defensive check: API contract says recommendations is an array,
      // but we guard anyway so MovieGrid never receives undefined.
      setMovies(Array.isArray(data.recommendations) ? data.recommendations : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Called by SearchBar when the user selects a suggestion
  const handleSelect = useCallback((title) => {
    fetchRecommendations(title)
  }, [fetchRecommendations])

  // Called by MovieGrid's "Try again" button
  const handleRetry = useCallback(() => {
    if (selectedMovie) fetchRecommendations(selectedMovie)
  }, [selectedMovie, fetchRecommendations])

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="pt-16 pb-10 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          🎬 Movie Recommender
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
          Search for a movie you like and discover similar ones instantly.
        </p>
      </header>

      {/* Search + Results */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16">

        {/* SearchBar is disabled while fetching so the user can't
            fire a second request before the first one completes */}
        <SearchBar
          onSelect={handleSelect}
          disabled={isLoading}
        />

        <MovieGrid
          seedMovie={selectedMovie}
          movies={movies}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-600 text-xs">
        Built with FastAPI + React · Data from TMDB
      </footer>

    </div>
  )
}