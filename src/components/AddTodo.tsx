'use client'

import { useState, useEffect, useRef } from 'react'
import { Todo, CreateTodoData, UpdateTodoData } from '@/types'

interface AddTodoProps {
  onAddTodo: (todo: CreateTodoData) => Promise<void>
  onUpdateTodo: (id: string, todo: UpdateTodoData) => Promise<void>
  editingTodo: Todo | null
  onCancelEdit: () => void
}

interface TagChipProps {
  tag: string
  onRemove: () => void
}

function TagChip({ tag, onRemove }: TagChipProps) {
  return (
    <span className="tag-chip">
      {tag}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </span>
  )
}

export default function AddTodo({ onAddTodo, onUpdateTodo, editingTodo, onCancelEdit }: AddTodoProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load editing todo data
  useEffect(() => {
    if (editingTodo) {
      // Use setTimeout to avoid synchronous state updates in effect
      setTimeout(() => {
        setTitle(editingTodo.title)
        setDescription(editingTodo.description || '')
        setTags(editingTodo.tags)
        setTagInput('')
      }, 0)
    } else {
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setTags([])
        setTagInput('')
      }, 0)
    }
  }, [editingTodo])

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

  // Filter suggestions based on input (case-insensitive)
  const filteredSuggestions = suggestions.filter(tag => {
    const matchesInput = tag.toLowerCase().includes(tagInput.toLowerCase())
    // Check case-insensitively if tag is already added
    const alreadyAdded = tags.some(existingTag => 
      existingTag.toLowerCase() === tag.toLowerCase()
    )
    return matchesInput && !alreadyAdded
  })

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag) {
      // Check case-insensitively if tag already exists
      const tagExists = tags.some(existingTag => 
        existingTag.toLowerCase() === trimmedTag.toLowerCase()
      )
      if (!tagExists) {
        setTags([...tags, trimmedTag])
        setTagInput('')
        setShowSuggestions(false)
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
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

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    const todoData = {
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    try {
      if (editingTodo) {
        await onUpdateTodo(editingTodo.id, todoData)
      } else {
        await onAddTodo(todoData)
      }
      
      // Clear form
      setTitle('')
      setDescription('')
      setTags([])
      setTagInput('')
      onCancelEdit()
    } catch (error) {
      console.error('Error saving todo:', error)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setTags([])
    setTagInput('')
    onCancelEdit()
  }

  return (
    <div className="bg-white border border-black rounded-lg p-5 mb-5">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="new todo"
          className="input-field flex-1"
        />
        <button
          onClick={handleSubmit}
          className="btn-primary px-6"
        >
          {editingTodo ? 'update' : 'add'}
        </button>
        {editingTodo && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 border border-gray-400 rounded text-gray-700 cursor-pointer text-base hover:bg-gray-300"
          >
            cancel
          </button>
        )}
      </div>
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleDescriptionKeyDown}
        placeholder="description"
        className="input-field w-full resize-y min-h-20 mb-3"
      />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          {/* Compact tag input */}
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
            placeholder="Add tag..."
            className="px-2 py-1 border border-gray-300 rounded text-sm w-48 text-left"
            style={{ 
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          />
          
          {/* Existing tags as removable chips */}
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
            ))}
          </div>
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
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
    </div>
  )
}
