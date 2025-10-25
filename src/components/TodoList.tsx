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
  const [showAllTags, setShowAllTags] = useState(false)

  const handleTitleClick = () => {
    setExpanded(!expanded)
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagClick(tag)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(todo)
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete(todo.id)
  }

  const handleToggleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleDelete(todo.id)
  }

  const visibleTags = showAllTags ? todo.tags : todo.tags.slice(0, 3)
  const hasMoreTags = todo.tags.length > 3

  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${todo.markedForDeletion ? 'opacity-50' : ''}`}>
      <div
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          todo.markedForDeletion ? 'line-through text-gray-500' : ''
        }`}
        onClick={handleTitleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className="w-4 h-4 flex-shrink-0"
            />
            <span
              className={`flex-1 truncate ${
                todo.completed ? 'line-through text-gray-500' : 'text-black'
              }`}
              title={todo.title} // Tooltip for truncated text
            >
              {todo.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Tags */}
            {todo.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {visibleTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => handleTagClick(tag, e)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
                {hasMoreTags && !showAllTags && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAllTags(true)
                    }}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    ...
                  </button>
                )}
                {hasMoreTags && showAllTags && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAllTags(false)
                    }}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    less
                  </button>
                )}
              </div>
            )}
            
            {/* Delete button */}
            <button
              onClick={handleToggleDelete}
              className={`px-3 py-1 rounded text-sm font-medium ${
                todo.markedForDeletion
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {todo.markedForDeletion ? 'restore' : 'delete'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expanded description */}
      {expanded && todo.description && (
        <div className="px-4 pb-4 ml-7 bg-gray-50 text-sm text-gray-600">
          {todo.description}
        </div>
      )}
    </div>
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
