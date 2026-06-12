import { useSearchBar } from '../hooks/useSearchBar'
import ErrorMessage from './ErrorMessage'

export default function SearchBar({ onSelect, disabled = false }) {
  const {
    query,
    suggestions,
    activeIndex,
    isOpen,
    isLoading,
    error,
    containerRef,
    inputRef,
    handleChange,
    handleKeyDown,
    commitSelection,
  } = useSearchBar({ onSelect })

  const showDropdown = isOpen && (isLoading || error || suggestions.length > 0  || query.trim().length > 0)

  return (
    <div
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-owns="search-listbox"
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth={2}
          viewBox="0 0 24 24" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          aria-label="Search for a movie"
          placeholder="Search a movie… e.g. The Dark Knight"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={[
            'w-full bg-zinc-900 border rounded-2xl',
            'pl-12 pr-12 py-4',
            'text-white placeholder-zinc-600 text-base',
            'outline-none transition-all duration-200',
            'focus-visible:ring-2 focus-visible:ring-accent/50',
            showDropdown
              ? 'border-accent/70 rounded-b-none shadow-lg shadow-black/30'
              : 'border-zinc-800 hover:border-zinc-700 focus:border-accent/70',
            disabled ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        />

        {/* Spinner */}
        {isLoading && (
          <span aria-label="Searching…" className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        )}

        {/* Clear button */}
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              handleChange({ target: { value: '' } })
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-0.5 rounded-full hover:bg-zinc-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Movie suggestions"
          className="absolute z-50 w-full bg-zinc-900 border border-t-0 border-accent/70 rounded-b-2xl overflow-hidden shadow-2xl shadow-black/60 max-h-72 overflow-y-auto"
        >
          {/* Loading skeletons */}
          {isLoading && suggestions.length === 0 && (
            [...Array(4)].map((_, i) => (
              <li key={`search-skeleton-${i}`} aria-hidden="true" className="px-4 py-3 flex items-center gap-3">
                <div className="skeleton-shimmer w-4 h-4 rounded shrink-0" />
                <div className="skeleton-shimmer h-3.5 rounded-md" style={{ width: `${55 + i * 10}%` }} />
              </li>
            ))
          )}

          {/* Error */}
          {error && !isLoading && (
            <li role="option" aria-selected="false" className="px-4 py-3.5 text-red-400 text-sm flex items-center gap-2.5">
              <ErrorMessage message={error} compact />
            </li>
          )}

          {/* Empty */}
          {!isLoading && !error && suggestions.length === 0 && (
            <li role="option" aria-selected="false" className="px-4 py-3.5 text-zinc-500 text-sm">
              No results for "{query}"
            </li>
          )}

          {/* Suggestions */}
          {!isLoading && !error && suggestions.map((title, index) => (
            <li
              key={`${title}-${index}`}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                commitSelection(title)
              }}
              className={[
                'px-4 py-3 cursor-pointer text-sm transition-colors duration-75',
                'flex items-center gap-3 select-none',
                index === activeIndex
                  ? 'bg-accent text-white'
                  : 'text-zinc-300 hover:bg-zinc-800',
                index < suggestions.length - 1 ? 'border-b border-zinc-800/70' : '',
              ].join(' ')}
            >
              <svg
                className={`w-3.5 h-3.5 shrink-0 ${index === activeIndex ? 'text-white/70' : 'text-zinc-600'}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
              </svg>
              <HighlightMatch text={title} query={query} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HighlightMatch({ text, query }) {
  const trimmed = query.trim()
  if (!trimmed) return <span>{text}</span>

  const index = text.toLowerCase().indexOf(trimmed.toLowerCase())
  if (index === -1) return <span>{text}</span>

  return (
    <span>
      {text.slice(0, index)}
      <span className="font-semibold text-white">
        {text.slice(index, index + trimmed.length)}
      </span>
      {text.slice(index + trimmed.length)}
    </span>
  )
}
