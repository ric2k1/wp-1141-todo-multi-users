'use client'

import { useState } from 'react'
import { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onToggleDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  onTagClick: (tag: string) => void
}

function TodoItem({ todo, onToggleComplete, onToggleDelete, onEdit, onTagClick }: TodoItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleTitleClick = () => {
    setExpanded(!expanded)
  }

  const handleDoubleClick = () => {
    onEdit(todo)
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagClick(tag)
  }

  const handleToggleComplete = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onToggleComplete(todo.id)
  }

  const handleToggleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleDelete(todo.id)
  }

  const visibleTags = todo.tags.slice(0, 3)
  const hasMoreTags = todo.tags.length > 3

  return (
    <>
      <div className={`todo-item ${todo.markedForDeletion ? 'marked-for-deletion' : ''}`}>
      <div
        className="flex items-center justify-between"
        onClick={handleTitleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            className="w-4 h-4 flex-shrink-0"
          />
          <div 
            className="flex-1 relative min-w-0"
            onMouseEnter={() => {
              // Check if title is truncated (scrollWidth > clientWidth)
              const element = document.getElementById(`todo-title-${todo.id}`)
              if (element && element.scrollWidth > element.clientWidth) {
                setShowTooltip(true)
              }
            }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span
              id={`todo-title-${todo.id}`}
              className={`block truncate ${
                todo.completed ? 'text-gray-500' : 'text-black'
              }`}
            >
              {todo.title}
            </span>
            {showTooltip && (
              <div className="absolute z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap top-full mt-1 left-0">
                {todo.title}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Tags */}
          {todo.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => handleTagClick(tag, e)}
                  className="tag-chip-clickable"
                >
                  {tag}
                </button>
              ))}
              {hasMoreTags && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTagsModal(true)
                  }}
                  className="tag-chip-clickable"
                >
                  ...
                </button>
              )}
            </div>
          )}
          
          {/* Delete button */}
          <button
            onClick={handleToggleDelete}
            className={todo.markedForDeletion ? 'btn-gray' : 'btn-red'}
          >
            {todo.markedForDeletion ? 'restore' : 'delete'}
          </button>
        </div>
      </div>
      
      {/* Expanded description */}
      {expanded && (
        <div className="px-4 pb-4 ml-7 bg-gray-50 text-sm text-gray-600">
          {todo.description || <span className="text-gray-400 italic">No description</span>}
        </div>
      )}
      </div>

      {/* Tags Modal */}
      {showTagsModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowTagsModal(false)}>
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-white border border-black rounded-lg shadow-lg max-w-md w-full mx-4 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">All Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {todo.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagClick(tag, e)
                      setShowTagsModal(false)
                    }}
                    className="tag-chip-clickable text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTagsModal(false)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface TodoListProps {
  todos: Todo[]
  onToggleComplete: (id: string) => void
  onToggleDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  onTagClick: (tag: string) => void
}

export default function TodoList({ 
  todos, 
  onToggleComplete, 
  onToggleDelete, 
  onEdit, 
  onTagClick 
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="bg-white border border-black rounded-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No todos found.</p>
        <p className="text-gray-500 text-sm mt-2">
          Add your first todo above or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-black rounded-lg overflow-hidden">
      <div className="todo-list max-h-96 overflow-y-auto">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onToggleDelete={onToggleDelete}
            onEdit={onEdit}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  )
}
