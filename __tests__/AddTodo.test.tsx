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
    expect(screen.getByPlaceholderText('tags')).toBeInTheDocument()
    expect(screen.getByText('add')).toBeInTheDocument()
  })

  it('renders update form when editing', () => {
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

    const tagInput = screen.getByPlaceholderText('tags')
    fireEvent.change(tagInput, { target: { value: 'newtag' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(screen.getByText('newtag')).toBeInTheDocument()
  })
})
