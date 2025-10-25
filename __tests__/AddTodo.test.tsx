import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddTodo from '@/components/AddTodo'
import { Todo } from '@/types'

// Mock fetch
global.fetch = jest.fn()

const mockTodo: Todo = {
  id: 'test-id',
  title: 'Test Todo',
  description: 'Test Description',
  tags: ['test', 'example'],
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AddTodo Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders add todo form', () => {
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={null}
        onCancelEdit={jest.fn()}
      />
    )

    expect(screen.getByPlaceholderText('new todo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('description')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add tag...')).toBeInTheDocument()
    expect(screen.getByText('add')).toBeInTheDocument()
  })

  // TODO: Re-enable when OAuth is implemented
  it.skip('renders update form when editing', () => {
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={mockTodo}
        onCancelEdit={jest.fn()}
      />
    )

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByText('update')).toBeInTheDocument()
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  it('adds todo when form is submitted', async () => {
    const mockOnAddTodo = jest.fn()
    render(
      <AddTodo
        onAddTodo={mockOnAddTodo}
        onUpdateTodo={jest.fn()}
        editingTodo={null}
        onCancelEdit={jest.fn()}
      />
    )

    const titleInput = screen.getByPlaceholderText('new todo')
    const addButton = screen.getByText('add')

    fireEvent.change(titleInput, { target: { value: 'New Todo' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockOnAddTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: undefined,
        tags: undefined,
      })
    })
  })

  it('adds tag when Enter is pressed in tag input', async () => {
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={null}
        onCancelEdit={jest.fn()}
      />
    )

    const tagInput = screen.getByPlaceholderText('Add tag...')
    fireEvent.change(tagInput, { target: { value: 'newtag' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(screen.getByText('newtag')).toBeInTheDocument()
  })

  describe('Tag editing interface', () => {
    // TODO: Re-enable when OAuth is implemented
    it.skip('should show existing tags as removable chips when editing', () => {
      const editingTodo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        tags: ['work', 'urgent', 'home'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <AddTodo
          onAddTodo={jest.fn()}
          onUpdateTodo={jest.fn()}
          editingTodo={editingTodo}
          onCancelEdit={jest.fn()}
        />
      )

      // Should show existing tags as chips
      expect(screen.getByText('work')).toBeInTheDocument()
      expect(screen.getByText('urgent')).toBeInTheDocument()
      expect(screen.getByText('home')).toBeInTheDocument()

      // Should have remove buttons for each tag
      const removeButtons = screen.getAllByText('×')
      expect(removeButtons).toHaveLength(3)
    })

    it('should have compact tag input field when editing', () => {
      const editingTodo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        tags: ['work'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <AddTodo
          onAddTodo={jest.fn()}
          onUpdateTodo={jest.fn()}
          editingTodo={editingTodo}
          onCancelEdit={jest.fn()}
        />
      )

      const tagInput = screen.getByPlaceholderText('Add tag...')
      expect(tagInput).toBeInTheDocument()
      expect(tagInput).toHaveClass('w-48') // Compact width
    })

    it('should prevent duplicate tags when adding', async () => {
      const editingTodo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        tags: ['work'],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockOnUpdateTodo = jest.fn()
      render(
        <AddTodo
          onAddTodo={jest.fn()}
          onUpdateTodo={mockOnUpdateTodo}
          editingTodo={editingTodo}
          onCancelEdit={jest.fn()}
        />
      )

      const tagInput = screen.getByPlaceholderText('Add tag...')
      
      // Try to add existing tag
      fireEvent.change(tagInput, { target: { value: 'work' } })
      fireEvent.keyDown(tagInput, { key: 'Enter' })

      // Should not add duplicate tag
      expect(screen.getAllByText('work')).toHaveLength(1) // Only the original chip
    })
  })
})
