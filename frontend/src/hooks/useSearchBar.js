/**
 * useSearchBar.js
 * ---------------
 * Encapsulates all SearchBar logic: query state, debounced API calls,
 * dropdown visibility, keyboard navigation, and click-outside detection.
 *
 * Keeping this out of SearchBar.jsx means the component is pure UI —
 * easy to restyle without touching any logic.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { searchMovies } from '../api/client'

export function useSearchBar({ onSelect }) {
  // Raw value of the text input
  const [query, setQuery] = useState('')

  // Suggestions returned from /search
  const [suggestions, setSuggestions] = useState([])

  // Which suggestion is keyboard-highlighted (-1 = none)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Dropdown open/closed
  const [isOpen, setIsOpen] = useState(false)

  // True while the /search fetch is in-flight
  const [isLoading, setIsLoading] = useState(false)

  // Non-null when the fetch failed
  const [error, setError] = useState(null)

  // Ref for the entire SearchBar container — used for click-outside detection
  const containerRef = useRef(null)

  // Ref for the input element — used to return focus after keyboard selection
  const inputRef = useRef(null)

  // Debounced query — API call only fires 300ms after the user stops typing
  const debouncedQuery = useDebounce(query, 300)

  // ---------------------------------------------------------------------------
  // Fetch suggestions whenever debouncedQuery changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Trim once and reuse
    const trimmed = debouncedQuery.trim()

    if (trimmed.length === 0) {
      setSuggestions([])
      setIsOpen(false)
      setError(null)
      return
    }

    let cancelled = false   // Prevents stale responses from older fetches
                            // from overwriting results of newer ones.
                            // e.g. user types "bat" then "batm" — if "bat"
                            // responds after "batm", we ignore it.

    setIsLoading(true)
    setError(null)

    searchMovies(trimmed)
      .then(data => {
        if (cancelled) return
        // API returns [{title: string}, ...] — extract the strings
        setSuggestions(data.map(item => item.title))
        setActiveIndex(-1)
        setIsOpen(true)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setSuggestions([])
        setIsOpen(true)   // Keep dropdown open to show the error state
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // ---------------------------------------------------------------------------
  // Click-outside closes the dropdown
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    // Use mousedown (not click) so the dropdown closes before the blur event
    // fires — prevents a race condition where clicking a suggestion closes the
    // dropdown before the click registers on the suggestion.
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------
  const handleKeyDown = useCallback((e) => {
    // Only act if the dropdown is open and has items
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActiveIndex(-1)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()   // Prevent cursor jumping to end of input
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
        break

      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break

      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          // Select the highlighted suggestion
          commitSelection(suggestions[activeIndex])
        } else if (suggestions.length > 0) {
          // No highlight — select the first result
          commitSelection(suggestions[0])
        }
        break

      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.focus()
        break

      default:
        break
    }
  }, [isOpen, suggestions, activeIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Commit a selection (keyboard or mouse)
  // ---------------------------------------------------------------------------
  // useCallback so SearchBar doesn't re-render when unrelated state changes
  const commitSelection = useCallback((title) => {
    setQuery(title)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
    onSelect(title)   // Lift the selected title up to Home.jsx
  }, [onSelect])

  // ---------------------------------------------------------------------------
  // Input change handler
  // ---------------------------------------------------------------------------
  const handleChange = useCallback((e) => {
    setQuery(e.target.value)
    // If the user clears the input, close immediately without waiting for debounce
    if (e.target.value.trim() === '') {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [])

  return {
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
  }
}