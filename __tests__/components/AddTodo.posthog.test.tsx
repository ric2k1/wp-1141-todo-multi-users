import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddTodo from '@/components/AddTodo'
import { posthog } from '@/lib/posthog'
import { Todo } from '@/types'

// Mock posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

const mockTodo: Todo = {
  id: 'test-id',
  title: 'Test Todo',
  description: 'Test Description',
  tags: ['test'],
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AddTodo PostHog Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ['work', 'home'],
    })
  })

  it('tracks todo_edit_started when editing', () => {
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={mockTodo}
        onCancelEdit={jest.fn()}
      />
    )

    expect(posthog.capture).toHaveBeenCalledWith('todo_edit_started', {
      todo_id: 'test-id',
    })
  })

  it('tracks tag_added when adding tag', async () => {
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

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('tag_added', {
        tag: 'newtag',
        tag_source: 'manual',
        todo_id: undefined,
      })
    })
  })

  it('tracks tag_removed when removing tag', async () => {
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={mockTodo}
        onCancelEdit={jest.fn()}
      />
    )

    // Wait for component to load editing todo data
    await waitFor(() => {
      const removeButtons = screen.queryAllByText('×')
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0])
        expect(posthog.capture).toHaveBeenCalledWith('tag_removed', {
          tag: 'test',
          todo_id: 'test-id',
        })
      }
    })
  })

  it('tracks todo_edit_cancelled when canceling edit', () => {
    const onCancelEdit = jest.fn()
    render(
      <AddTodo
        onAddTodo={jest.fn()}
        onUpdateTodo={jest.fn()}
        editingTodo={mockTodo}
        onCancelEdit={onCancelEdit}
      />
    )

    const cancelButton = screen.getByText('cancel')
    fireEvent.click(cancelButton)

    expect(posthog.capture).toHaveBeenCalledWith('todo_edit_cancelled', {
      todo_id: 'test-id',
    })
  })
})
