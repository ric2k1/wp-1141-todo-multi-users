'use client'

import { useState } from 'react'
import { Todo, TodoFilters } from '@/types'

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

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = filters.tags.filter(tag => tag !== tagToRemove)
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleDoneToggle = () => {
    const newDone = filters.done === null ? true : filters.done === true ? false : null
    onFiltersChange({ ...filters, done: newDone })
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
    <div className="bg-white border border-black rounded-lg p-4 mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Tag filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Filter by tags:</span>
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
              {filters.tags.length === 0 && (
                <span className="text-gray-500 text-sm">No filters</span>
              )}
            </div>
          </div>

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
        </div>

        {/* Clear button */}
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
