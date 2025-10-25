'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const fetchTodos = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','))
      }
      if (filters.done !== null) {
        params.append('done', filters.done.toString())
      }

      const response = await fetch(`/api/todos?${params.toString()}`)
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load todos when filters change
  useEffect(() => {
    fetchTodos()
  }, [filters])

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