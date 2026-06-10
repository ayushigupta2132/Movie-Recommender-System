import { useState } from 'react'
import SearchBar from '../components/SearchBar'

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null)

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

      {/* Search */}
      <main className="flex-1 px-4">
        <SearchBar onSelect={setSelectedMovie} />

        {selectedMovie && (
          <p className="text-center text-zinc-400 mt-6 text-sm">
            Selected: <span className="text-white font-medium">{selectedMovie}</span>
            {' '}— recommendations coming in Phase 3
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-600 text-xs">
        Built with FastAPI + React · Data from TMDB
      </footer>

    </div>
  )
}