import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { searchMovies } from '../api/client'

export function useSearchBar({ onSelect }) {
  const [query, setQuery]             = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen]           = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState(null)

  const containerRef = useRef(null)
  const inputRef     = useRef(null)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions whenever debounced query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (trimmed.length === 0) {
      setSuggestions([])
      setIsOpen(false)
      setError(null)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)

    searchMovies(trimmed)
      .then(data => {
        if (cancelled) return
        setSuggestions(data.map(item => item.title))
        setActiveIndex(-1)
        setIsOpen(true)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setSuggestions([])
        setIsOpen(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Commit a selection — defined before handleKeyDown so it's in scope
  const commitSelection = useCallback((title) => {
    setQuery(title)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
    onSelect(title)
  }, [onSelect])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActiveIndex(-1)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          commitSelection(suggestions[activeIndex])
        } else if (suggestions.length > 0) {
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
  }, [isOpen, suggestions, activeIndex, commitSelection])

  const handleChange = useCallback((e) => {
    setQuery(e.target.value)
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