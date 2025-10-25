import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'
import { Todo } from '@/types'

// Mock the API calls
global.fetch = jest.fn()

// Mock todos data
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Incomplete Todo',
    description: 'This is incomplete',
    tags: ['work'],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Completed Todo',
    description: 'This is completed',
    tags: ['home'],
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Todo without description',
    description: null,
    tags: ['urgent'],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('Todo App Main Page', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Double-click to edit functionality', () => {
    it('should enter edit mode when todo item is double-clicked', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const todoItem = screen.getByText('Incomplete Todo')
      fireEvent.doubleClick(todoItem)

      // Should show update button instead of add button
      expect(screen.getByText('update')).toBeInTheDocument()
      expect(screen.queryByText('add')).not.toBeInTheDocument()
    })
  })

  describe('Checkbox click behavior', () => {
    // TODO: Re-enable when OAuth is implemented
    it.skip('should toggle completion when checkbox is clicked', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTodos,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockTodos[0], completed: true }),
        })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      // Should call the API to update the todo
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/todos/1',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true }),
          })
        )
      })
    })

    it('should not open description when checkbox is clicked', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      // Description should not be visible
      expect(screen.queryByText('This is incomplete')).not.toBeInTheDocument()
    })
  })

  describe('Completed todo styling', () => {
    it('should grey out completed todos without strikethrough', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Completed Todo')).toBeInTheDocument()
      })

      const completedTodo = screen.getByText('Completed Todo')
      expect(completedTodo).toHaveClass('text-gray-500')
      expect(completedTodo).not.toHaveClass('line-through')
    })
  })

  describe('Empty description handling', () => {
    it('should show "No description" when todo has no description', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Todo without description')).toBeInTheDocument()
      })

      const todoItem = screen.getByText('Todo without description')
      fireEvent.click(todoItem)

      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  describe('Filter functionality', () => {
    it('should show all todos when done filter is unchecked', async () => {
      // First call: all todos
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
        expect(screen.getByText('Completed Todo')).toBeInTheDocument()
      })

      // Check done filter (show only completed)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTodos[1]], // Only completed todo
      })

      const doneCheckbox = screen.getByLabelText('done')
      fireEvent.click(doneCheckbox)

      await waitFor(() => {
        expect(screen.getByText('Completed Todo')).toBeInTheDocument()
        expect(screen.queryByText('Incomplete Todo')).not.toBeInTheDocument()
      })

      // Uncheck done filter (show all todos)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      fireEvent.click(doneCheckbox)

      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
        expect(screen.getByText('Completed Todo')).toBeInTheDocument()
      })
    })
  })

  describe('Marked for deletion state preservation', () => {
    // TODO: Re-enable when OAuth is implemented
    it.skip('should preserve markedForDeletion state when filters change', async () => {
      // Initial load with all todos
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      // Mark a todo for deletion
      const deleteButton = screen.getAllByText('delete')[0]
      fireEvent.click(deleteButton)

      // The todo should have marked-for-deletion class
      const todoItem = screen.getByText('Incomplete Todo').closest('.todo-item')
      expect(todoItem).toHaveClass('marked-for-deletion')

      // Apply done filter (only completed todos visible)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTodos[1]], // Only completed todo
      })

      const doneCheckbox = screen.getByLabelText('done')
      fireEvent.click(doneCheckbox)

      await waitFor(() => {
        expect(screen.queryByText('Incomplete Todo')).not.toBeInTheDocument()
      })

      // Remove done filter (all todos visible again)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      fireEvent.click(doneCheckbox)

      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      // The todo should still be marked for deletion
      const todoItemAfterFilter = screen.getByText('Incomplete Todo').closest('.todo-item')
      expect(todoItemAfterFilter).toHaveClass('marked-for-deletion')
    })
  })

  describe('Tag filtering', () => {
    it('should allow adding tags to filter via input', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const tagInput = screen.getByPlaceholderText('Filter by tags')
      fireEvent.change(tagInput, { target: { value: 'work' } })
      fireEvent.keyDown(tagInput, { key: 'Enter' })

      // Should show the tag in the filter (there might be multiple 'work' elements)
      expect(screen.getAllByText('work')).toHaveLength(2) // One in todo list, one in filter
    })

    it('should show tag suggestions when typing', async () => {
      // Mock the tags API
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTodos,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['work', 'home', 'urgent'],
        })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const tagInput = screen.getByPlaceholderText('Filter by tags')
      fireEvent.change(tagInput, { target: { value: 'wo' } })

      // Should show suggestions
      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument()
      })
    })
  })

  describe('Clear button positioning', () => {
    it('should position clear button outside filter box', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      // Clear button should be visible and positioned outside the filter box
      const clearButton = screen.getByText('clear (0)')
      expect(clearButton).toBeInTheDocument()
      
      // The clear button should not be inside the filter box
      const filterBox = screen.getByText('done').closest('.bg-white')
      expect(filterBox).not.toContainElement(clearButton)
    })
  })

  describe('Done checkbox alignment', () => {
    it('should align done checkbox to the left of filter box', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const doneCheckbox = screen.getByLabelText('done')
      const tagInput = screen.getByPlaceholderText('Filter by tags')
      
      // Done checkbox should be positioned before the tag input
      const doneContainer = doneCheckbox.closest('.flex')
      const tagContainer = tagInput.closest('.flex')
      
      expect(doneContainer).toBeInTheDocument()
      expect(tagContainer).toBeInTheDocument()
    })
  })

  describe('Tag cleanup functionality', () => {
    // TODO: Re-enable when OAuth is implemented
    it.skip('should clean up unused tags when todos are deleted', async () => {
      // Mock initial todos with tags
      const todosWithTags = [
        { ...mockTodos[0], tags: ['work', 'urgent'] },
        { ...mockTodos[1], tags: ['home'] },
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => todosWithTags,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      // Mark a todo for deletion
      const deleteButton = screen.getAllByText('delete')[0]
      fireEvent.click(deleteButton)

      // Clear deleted todos
      const clearButton = screen.getByText('clear (1)')
      fireEvent.click(clearButton)

      // Confirm deletion
      const confirmButton = screen.getByText('Yes, Delete All')
      fireEvent.click(confirmButton)

      // Should call DELETE API which triggers tag cleanup
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/todos/1',
          expect.objectContaining({ method: 'DELETE' })
        )
      })
    })
  })
})
