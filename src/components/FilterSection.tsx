'use client'

import { useState, useEffect, useRef } from 'react'
import { TodoFilters } from '@/types'
import { posthog } from '@/lib/posthog'

interface FilterSectionProps {
  filters: TodoFilters
  onFiltersChange: (filters: TodoFilters) => void
  onClearDeleted: () => void
  deletedCount: number
}

export default function FilterSection({ 
  filters, 
  onFiltersChange, 
  onClearDeleted, 
  deletedCount 
}: FilterSectionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch tag suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/tags')
        const allTags = await response.json()
        setSuggestions(allTags)
      } catch (error) {
        console.error('Error fetching tag suggestions:', error)
      }
    }
    fetchSuggestions()
  }, [])

  // Track filter application
  useEffect(() => {
    const hasTags = filters.tags.length > 0
    const hasDone = filters.done !== null
    
    if (hasTags || hasDone) {
      const filterType = hasTags && hasDone ? 'both' : hasTags ? 'tag' : 'done'
      posthog.capture('filter_applied', {
        filter_type: filterType,
        tag_count: filters.tags.length,
        show_done_only: filters.done === true,
      })
    }
  }, [filters])

  // Filter suggestions based on input (case-insensitive)
  const filteredSuggestions = suggestions.filter(tag => {
    const matchesInput = tag.toLowerCase().includes(tagInput.toLowerCase())
    // Check case-insensitively if tag is already in filters
    const alreadyAdded = filters.tags.some(existingTag => 
      existingTag.toLowerCase() === tag.toLowerCase()
    )
    return matchesInput && !alreadyAdded
  })

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = filters.tags.filter(tag => tag !== tagToRemove)
    onFiltersChange({ ...filters, tags: newTags })
    
    // Track filter tag removed
    posthog.capture('filter_tag_removed', {
      tag: tagToRemove,
    })
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag) {
      // Check case-insensitively if tag already exists
      const tagExists = filters.tags.some(existingTag => 
        existingTag.toLowerCase() === trimmedTag.toLowerCase()
      )
      if (!tagExists) {
        const newTags = [...filters.tags, trimmedTag]
        onFiltersChange({ ...filters, tags: newTags })
        setTagInput('')
        setShowSuggestions(false)
        
        // Track filter tag added
        posthog.capture('filter_tag_added', {
          tag: trimmedTag,
          total_filter_tags: newTags.length,
        })
      }
    }
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInput.trim()) {
        handleAddTag(tagInput.trim())
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleDoneToggle = () => {
    const newDone = filters.done === null ? true : null
    onFiltersChange({ ...filters, done: newDone })
    
    // Track filter done toggle
    posthog.capture('filter_done_toggled', {
      show_done_only: newDone === true,
    })
  }

  const handleClearDeleted = () => {
    if (deletedCount > 0) {
      setShowConfirmDialog(true)
    }
  }

  const confirmClear = () => {
    onClearDeleted()
    setShowConfirmDialog(false)
  }

  const cancelClear = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        {/* Filter section */}
        <div className="bg-white border border-black rounded-lg p-4 flex-1 mr-4">
          <div className="flex items-center space-x-4">
            {/* Done filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="done-filter"
                checked={filters.done === true}
                onChange={handleDoneToggle}
                className="w-4 h-4"
              />
              <label htmlFor="done-filter" className="text-sm font-medium">
                done
              </label>
            </div>

            {/* Tag filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setShowSuggestions(e.target.value.length > 0) // Only show when typing
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowSuggestions(tagInput.length > 0)} // Only show if there's input
                  placeholder="Filter by tags"
                  className="px-2 py-1 border border-gray-300 rounded text-sm w-40"
                />
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
                  >
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddTag(suggestion)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-gray-800 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clear button - aligned horizontally */}
        <button
          onClick={handleClearDeleted}
          disabled={deletedCount === 0}
          className={`px-4 py-2 rounded text-white text-sm font-medium transition-colors duration-200 ${
            deletedCount > 0
              ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          clear ({deletedCount})
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-lg font-semibold mb-4">
              Removing {deletedCount} todo items?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All marked todos will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmClear}
                className="flex-1 btn-red"
              >
                Yes, Delete All
              </button>
              <button
                onClick={cancelClear}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
