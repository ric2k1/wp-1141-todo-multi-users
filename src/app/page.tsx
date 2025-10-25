'use client'

import { useState, useEffect } from 'react'
import AddTodo from '@/components/AddTodo'
import { Todo, CreateTodoData, UpdateTodoData } from '@/types'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-lg">Loading todos...</div>
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

        <div className="bg-white border border-black rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Todo List</h2>
          {todos.length === 0 ? (
            <p className="text-gray-600">No todos yet. Add your first todo above!</p>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                  onDoubleClick={() => handleEditTodo(todo)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleUpdateTodo(todo.id, { completed: !todo.completed })}
                        className="w-4 h-4"
                      />
                      <span className={todo.completed ? 'line-through text-gray-500' : 'text-black'}>
                        {todo.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {todo.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {todo.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {todo.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{todo.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => handleUpdateTodo(todo.id, {})} // Placeholder for delete
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                  {todo.description && (
                    <div className="mt-2 text-sm text-gray-600 ml-7">
                      {todo.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}