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

  it('shows completed todos greyed out without strikethrough', () => {
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
    expect(todo2).toHaveClass('text-gray-500')
    expect(todo2).not.toHaveClass('line-through')
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

  it('calls onEdit when todo item is double-clicked', () => {
    const mockOnEdit = jest.fn()
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={mockOnEdit}
        onTagClick={jest.fn()}
      />
    )

    const todoItem = screen.getByText('Todo 1')
    fireEvent.doubleClick(todoItem)

    expect(mockOnEdit).toHaveBeenCalledWith(mockTodos[0])
  })

  it('shows "No description" when todo has no description', () => {
    const todoWithoutDescription = {
      ...mockTodos[0],
      description: null,
    }

    render(
      <TodoList
        todos={[todoWithoutDescription]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const todoItem = screen.getByText('Todo 1')
    fireEvent.click(todoItem)

    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('shows marked-for-deletion styling when todo is marked for deletion', () => {
    const todoMarkedForDeletion = {
      ...mockTodos[0],
      markedForDeletion: true,
    }

    render(
      <TodoList
        todos={[todoMarkedForDeletion]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const todoItem = screen.getByText('Todo 1').closest('.todo-item')
    expect(todoItem).toHaveClass('marked-for-deletion')
  })

  it('shows only first 3 tags and "..." button when there are more than 3 tags', () => {
    const todoWithManyTags = {
      ...mockTodos[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    }

    render(
      <TodoList
        todos={[todoWithManyTags]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('tag3')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.queryByText('tag4')).not.toBeInTheDocument()
    expect(screen.queryByText('tag5')).not.toBeInTheDocument()
  })

  it('shows all tags in modal when "..." button is clicked', () => {
    const todoWithManyTags = {
      ...mockTodos[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    }

    render(
      <TodoList
        todos={[todoWithManyTags]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const moreButton = screen.getByText('...')
    fireEvent.click(moreButton)

    expect(screen.getByText('All Tags')).toBeInTheDocument()
    // Use getAllByText to handle multiple elements with same text
    expect(screen.getAllByText('tag1')).toHaveLength(2) // One in main list, one in modal
    expect(screen.getAllByText('tag2')).toHaveLength(2)
    expect(screen.getAllByText('tag3')).toHaveLength(2)
    expect(screen.getByText('tag4')).toBeInTheDocument()
    expect(screen.getByText('tag5')).toBeInTheDocument()
  })

  it('closes modal when Close button is clicked', () => {
    const todoWithManyTags = {
      ...mockTodos[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    }

    render(
      <TodoList
        todos={[todoWithManyTags]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={jest.fn()}
      />
    )

    const moreButton = screen.getByText('...')
    fireEvent.click(moreButton)

    expect(screen.getByText('All Tags')).toBeInTheDocument()

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(screen.queryByText('All Tags')).not.toBeInTheDocument()
  })

  it('calls onTagClick and closes modal when tag in modal is clicked', () => {
    const mockOnTagClick = jest.fn()
    const todoWithManyTags = {
      ...mockTodos[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    }

    render(
      <TodoList
        todos={[todoWithManyTags]}
        onToggleComplete={jest.fn()}
        onToggleDelete={jest.fn()}
        onEdit={jest.fn()}
        onTagClick={mockOnTagClick}
      />
    )

    const moreButton = screen.getByText('...')
    fireEvent.click(moreButton)

    const tag4Button = screen.getAllByText('tag4')[0]
    fireEvent.click(tag4Button)

    expect(mockOnTagClick).toHaveBeenCalledWith('tag4')
    expect(screen.queryByText('All Tags')).not.toBeInTheDocument()
  })
})
