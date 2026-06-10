/**
 * SearchBar.jsx
 * -------------
 * Autocomplete search input. Pure UI — all logic lives in useSearchBar.
 *
 * Props:
 *   onSelect(title: string) — called when the user commits a selection.
 *   disabled: bool          — disables input while recommendations are loading.
 */
import { useSearchBar } from '../hooks/useSearchBar'

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

  // Dropdown should render when open AND there's something to show
  const showDropdown = isOpen && (isLoading || error || suggestions.length > 0)

  return (
    // role="combobox" is the correct ARIA pattern for an input + listbox combo
    <div
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-owns="search-listbox"
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Input                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"
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
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          aria-label="Search for a movie"
          placeholder="Search a movie… e.g. Batman Begins"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={[
            'w-full bg-zinc-900 border rounded-xl',
            'pl-12 pr-12 py-4',
            'text-white placeholder-zinc-500 text-base',
            'outline-none transition-all duration-150',
            showDropdown
              ? 'border-accent rounded-b-none'
              : 'border-zinc-700 hover:border-zinc-500 focus:border-accent',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />

        {/* Spinner — visible while debounced fetch is in-flight */}
        {isLoading && (
          <span
            aria-label="Searching…"
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <svg
              className="w-5 h-5 text-accent animate-spin"
              fill="none" viewBox="0 0 24 24" aria-hidden="true"
            >
              <circle
                className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}

        {/* Clear button — visible when there's text and not loading */}
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              handleChange({ target: { value: '' } })
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Dropdown                                                             */}
      {/* ------------------------------------------------------------------ */}
      {showDropdown && (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Movie suggestions"
          className="absolute z-50 w-full bg-zinc-900 border border-t-0 border-accent rounded-b-xl overflow-hidden shadow-2xl"
        >

          {/* Loading skeleton rows */}
          {isLoading && suggestions.length === 0 && (
            <>
              {[...Array(3)].map((_, i) => (
                <li key={i} aria-hidden="true" className="px-4 py-3">
                  <div className="skeleton-shimmer h-4 rounded w-3/4" />
                </li>
              ))}
            </>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <li role="option" aria-selected="false" className="px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </li>
          )}

          {/* Empty state — query was sent but nothing matched */}
          {!isLoading && !error && suggestions.length === 0 && (
            <li role="option" aria-selected="false" className="px-4 py-3 text-zinc-500 text-sm">
              No movies found for "{query}"
            </li>
          )}

          {/* Suggestion rows */}
          {!isLoading && !error && suggestions.map((title, index) => (
            <li
              key={title}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // mousedown instead of onClick: fires before onBlur so the
              // dropdown doesn't close before the click registers
              onMouseDown={(e) => {
                e.preventDefault()
                commitSelection(title)
              }}
              onMouseEnter={() => {}}
              className={[
                'px-4 py-3 cursor-pointer text-sm transition-colors duration-75',
                'flex items-center gap-3',
                index === activeIndex
                  ? 'bg-accent text-white'
                  : 'text-zinc-200 hover:bg-zinc-800',
                index < suggestions.length - 1 ? 'border-b border-zinc-800' : '',
              ].join(' ')}
            >
              {/* Film icon */}
              <svg className="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
              </svg>
              {/* Highlight matching substring */}
              <HighlightMatch text={title} query={query} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// HighlightMatch — bolds the part of the title that matches the query.
// Pure component, no state, no side effects.
// ---------------------------------------------------------------------------
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