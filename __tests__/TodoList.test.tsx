import { render, screen, fireEvent } from '@testing-library/react'
import TodoList from '@/components/TodoList'
import { Todo } from '@/types'

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Todo 1',
    description: 'Description 1',
    tags: ['work', 'urgent'],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Todo 2',
    description: 'Description 2',
    tags: ['home'],
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('TodoList Component', () => {
  it('renders todo list', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    expect(screen.getByText('Todo 1')).toBeInTheDocument()
    expect(screen.getByText('Todo 2')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.getByText('home')).toBeInTheDocument()
  })

  it('shows completed todos with strikethrough', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const todo2 = screen.getByText('Todo 2')
    expect(todo2).toHaveClass('line-through')
  })

  it('calls onToggleComplete when checkbox is clicked', () => {
    const mockOnToggleComplete = jest.fn()
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={mockOnToggleComplete}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)

    expect(mockOnToggleComplete).toHaveBeenCalledWith('1')
  })

  it('calls onTagClick when tag is clicked', () => {
    const mockOnTagClick = jest.fn()
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={mockOnTagClick}
      />
    )

    const workTag = screen.getByText('work')
    fireEvent.click(workTag)

    expect(mockOnTagClick).toHaveBeenCalledWith('work')
  })

  it('shows empty state when no todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    expect(screen.getByText('No todos found.')).toBeInTheDocument()
    expect(screen.getByText('Add your first todo above or adjust your filters.')).toBeInTheDocument()
  })
})
