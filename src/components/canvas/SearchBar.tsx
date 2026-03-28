'use client'

import { useState, useCallback } from 'react'

interface SearchBarProps {
  query: string
  onSearch: (query: string) => void
  matchCount?: number
  totalCount?: number
}

export function SearchBar({ query, onSearch, matchCount = 0, totalCount = 0 }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query)
  const [isFocused, setIsFocused] = useState(false)
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    onSearch(value)
  }, [onSearch])
  
  const handleClear = useCallback(() => {
    setLocalQuery('')
    onSearch('')
  }, [onSearch])
  
  const hasQuery = localQuery.length > 0
  
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 bg-surface-container-low border rounded-lg
      transition-all duration-200
      ${isFocused ? 'border-primary' : 'border-outline-variant/20'}
    `}>
      <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      
      <input
        ref={(el) => {
          if (el) (el as any).dataset.workspaceSearch = 'true'
        }}
        type="text"
        value={localQuery}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search graph... (Ctrl+F)"
        className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder-zinc-600 min-w-0"
      />
      
      {hasQuery && (
        <>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {matchCount} / {totalCount}
          </span>
          
          <button
            onClick={handleClear}
            className="p-1 hover:bg-surface-container-high rounded transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
