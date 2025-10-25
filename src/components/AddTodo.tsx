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
    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm mr-1 mb-1">
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
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || '')
      setTags(editingTodo.tags)
    } else {
      setTitle('')
      setDescription('')
      setTags([])
    }
    setTagInput('')
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

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !tags.includes(tag)
  )

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()])
      setTagInput('')
      setShowSuggestions(false)
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
          className="flex-1 px-3 py-2 border border-black rounded text-base"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-transparent border border-black rounded text-black cursor-pointer text-base hover:bg-gray-100"
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
        className="w-full px-3 py-2 border border-black rounded text-base resize-y min-h-20 mb-3"
      />
      
      <div className="relative">
        <div className="flex flex-wrap mb-2">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
          ))}
        </div>
        
        <input
          ref={tagInputRef}
          type="text"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value)
            setShowSuggestions(e.target.value.length > 0)
          }}
          onKeyDown={handleTagInputKeyDown}
          onFocus={() => setShowSuggestions(tagInput.length > 0)}
          placeholder="tags"
          className="w-full px-3 py-2 border border-black rounded text-base"
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
    </div>
  )
}
