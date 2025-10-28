import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'
import { Todo } from '@/types'

// Mock the API calls
global.fetch = jest.fn()

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated',
  }),
  signOut: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

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
    (global.fetch as jest.Mock).mockReset()
    // Set up default implementation
    const defaultImpl = (url: string) => {
      if (url.includes("/api/tags")) {
        return Promise.resolve({
          ok: true,
          json: async () => ["work", "home", "urgent", "test"],
        })
      }
      
      if (url.includes("/api/todos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        })
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    }
    ;(global.fetch as jest.Mock).mockImplementation(defaultImpl)
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

      // Should show the tag in the filter
      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument()
      })
    })

    it('should show tag suggestions when typing', async () => {
      // Mock the initial todos
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Todo')).toBeInTheDocument()
      })

      const tagInput = screen.getByPlaceholderText('Filter by tags')
      fireEvent.change(tagInput, { target: { value: 'wo' } })
      fireEvent.focus(tagInput)

      // Tag suggestions should appear (they're in a dropdown)
      await waitFor(() => {
        const suggestions = screen.queryAllByText('work')
        expect(suggestions.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
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

})
