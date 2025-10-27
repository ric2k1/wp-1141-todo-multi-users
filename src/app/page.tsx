'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AddTodo from '@/components/AddTodo'
import TodoList from '@/components/TodoList'
import FilterSection from '@/components/FilterSection'
import { Todo, CreateTodoData, UpdateTodoData, TodoFilters } from '@/types'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TodoFilters>({
    tags: [],
    done: null
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Handle logout
  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
    })
  }

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      // Don't send tags to backend - filter on frontend for case-insensitive matching
      const params = new URLSearchParams()
      if (filters.done !== null) {
        params.append('done', filters.done.toString())
      }

      const response = await fetch(`/api/todos?${params.toString()}`)
      
      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data)
        return
      }
      
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
      // Set empty array on error to prevent map() errors
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [filters, router])

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

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newTodo = await response.json()
      setTodos([newTodo, ...todos]) // Add to beginning (newest first)
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

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const updatedTodo = await response.json()
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ))
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
      const deletePromises = deletedTodos.map(async (todo) => {
        const response = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
        if (!response.ok && response.status === 401) {
          router.push('/login')
          throw new Error('Unauthorized')
        }
        return response
      })
      
      await Promise.all(deletePromises)
      
      // Remove from local state
      setTodos(todos.filter(todo => !todo.markedForDeletion))
    } catch (error) {
      console.error('Error clearing deleted todos:', error)
      if (error instanceof Error && error.message === 'Unauthorized') {
        return // Don't show additional error if redirecting to login
      }
      // You could add a toast notification here for user feedback
    }
  }

  // Calculate deleted count
  const deletedCount = todos.filter(todo => todo.markedForDeletion).length

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="ml-3 text-lg">
          {status === 'loading' ? 'Authenticating...' : 'Loading todos...'}
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto p-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            todo list
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {session?.user?.name}!
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>

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