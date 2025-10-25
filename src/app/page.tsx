'use client'

import { useState, useEffect, useCallback } from 'react'
import AddTodo from '@/components/AddTodo'
import TodoList from '@/components/TodoList'
import FilterSection from '@/components/FilterSection'
import { Todo, CreateTodoData, UpdateTodoData, TodoFilters } from '@/types'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TodoFilters>({
    tags: [],
    done: null
  })

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      // Don't send tags to backend - filter on frontend for case-insensitive matching
      const params = new URLSearchParams()
      if (filters.done !== null) {
        params.append('done', filters.done.toString())
      }

      const response = await fetch(`/api/todos?${params.toString()}`)
      const data = await response.json()
      
      // Apply case-insensitive tag filtering on frontend
      let filteredData = data
      if (filters.tags.length > 0) {
        filteredData = data.filter((todo: Todo) => {
          return filters.tags.some(filterTag => 
            todo.tags.some(todoTag => 
              todoTag.toLowerCase() === filterTag.toLowerCase()
            )
          )
        })
      }
      
      // Apply case-insensitive done filtering
      if (filters.done !== null) {
        filteredData = filteredData.filter((todo: Todo) => {
          return filters.done === null || todo.completed === filters.done
        })
      }
      
      // Preserve markedForDeletion state when updating todos
      setTodos(prevTodos => {
        // Merge new data with preserved markedForDeletion state
        const updatedTodos = filteredData.map((todo: Todo) => {
          // Find the existing todo to preserve markedForDeletion state
          const existingTodo = prevTodos.find(t => t.id === todo.id)
          return {
            ...todo,
            markedForDeletion: existingTodo?.markedForDeletion ?? false
          }
        })
        
        return updatedTodos
      })
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load todos when filters change
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Handle adding a new todo
  const handleAddTodo = async (todoData: CreateTodoData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })

      if (response.ok) {
        const newTodo = await response.json()
        setTodos([newTodo, ...todos]) // Add to beginning (newest first)
      } else {
        throw new Error('Failed to create todo')
      }
    } catch (error) {
      console.error('Error creating todo:', error)
      throw error
    }
  }

  // Handle updating a todo
  const handleUpdateTodo = async (id: string, todoData: UpdateTodoData) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ))
      } else {
        throw new Error('Failed to update todo')
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingTodo(null)
  }

  // Handle double-click to edit
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
  }

  // Handle toggle completion
  const handleToggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await handleUpdateTodo(id, { completed: !todo.completed })
    }
  }

  // Handle toggle delete (soft delete)
  const handleToggleDelete = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, markedForDeletion: !todo.markedForDeletion }
        : todo
    ))
  }

  // Handle tag click to add to filter
  const handleTagClick = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters({ ...filters, tags: [...filters.tags, tag] })
    }
  }

  // Handle clear deleted todos
  const handleClearDeleted = async () => {
    const deletedTodos = todos.filter(todo => todo.markedForDeletion)
    
    try {
      // Delete todos from database
      await Promise.all(
        deletedTodos.map(todo => 
          fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
        )
      )
      
      // Remove from local state
      setTodos(todos.filter(todo => !todo.markedForDeletion))
    } catch (error) {
      console.error('Error clearing deleted todos:', error)
    }
  }

  // Calculate deleted count
  const deletedCount = todos.filter(todo => todo.markedForDeletion).length

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="ml-3 text-lg">Loading todos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto p-5">
        <h1 className="text-center text-4xl font-bold text-black mb-8">
          todo list (ric)
        </h1>

        <AddTodo
          onAddTodo={handleAddTodo}
          onUpdateTodo={handleUpdateTodo}
          editingTodo={editingTodo}
          onCancelEdit={handleCancelEdit}
        />

        <FilterSection
          filters={filters}
          onFiltersChange={setFilters}
          onClearDeleted={handleClearDeleted}
          deletedCount={deletedCount}
        />

        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onToggleDelete={handleToggleDelete}
          onEdit={handleEditTodo}
          onTagClick={handleTagClick}
        />
      </div>
    </div>
  )
}