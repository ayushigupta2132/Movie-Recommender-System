import { useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import MovieGrid from "../components/MovieGrid";
import { getRecommendations } from "../api/client";

const SUGGESTION_CHIPS = [
  "Inception",
  "The Dark Knight",
  "Interstellar",
  "The Matrix",
];

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(
    async (title) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      // Prevent duplicate requests for the same title while loading
      if (isLoading) return;

      setSelectedMovie(trimmed);
      setIsLoading(true);
      setError(null);
      setMovies([]);

      try {
        const data = await getRecommendations(trimmed, 5);
        setMovies(
          Array.isArray(data.recommendations) ? data.recommendations : [],
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSelect = useCallback(
    (title) => {
      fetchRecommendations(title);
    },
    [fetchRecommendations],
  );

  const handleRetry = useCallback(() => {
    if (selectedMovie) fetchRecommendations(selectedMovie);
  }, [selectedMovie, fetchRecommendations]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Decorative ambient glow — absolute so it doesn't affect mobile scroll */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] opacity-[0.15] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at top, #E50914 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative pt-20 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-medium mb-5 tracking-wide uppercase">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
            aria-hidden="true"
          />
          Content-Based Filtering
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 text-balance">
          Movie Recommender
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-sm mx-auto leading-relaxed text-balance">
          Search a movie you love. Discover five you'll enjoy next.
        </p>
      </header>

      {/* Main */}
      <main className="relative flex-1 w-full max-w-5xl mx-auto px-4 pb-20">
        <SearchBar onSelect={handleSelect} disabled={isLoading} />

        {/* Initial state — shown before first search */}
        {!selectedMovie && !isLoading && (
          <div className="mt-20 flex flex-col items-center gap-4 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-zinc-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <div>
              <p className="text-zinc-300 font-medium">
                Start by searching a movie
              </p>
              <p className="text-zinc-600 text-sm mt-1">
                Try one of these to get started
              </p>
            </div>
          </div>
        )}

        {/* Quick-pick chips — always available */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-8"
          role="list"
          aria-label="Movie suggestions"
        >
          {SUGGESTION_CHIPS.map((title) => (
            <button
              key={title}
              role="listitem"
              onClick={() => fetchRecommendations(title)}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {title}
            </button>
          ))}
        </div>

        <MovieGrid
          seedMovie={selectedMovie}
          movies={movies}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </main>

      {/* Footer */}
      <footer className="relative py-8 border-t border-zinc-900">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-zinc-600 text-xs">
          <span>Built with FastAPI + React + scikit-learn</span>
          <span className="hidden sm:inline text-zinc-800" aria-hidden="true">
            ·
          </span>
          <span>Movie data from TMDB</span>
        </div>
      </footer>
    </div>
  );
}
