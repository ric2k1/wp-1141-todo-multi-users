import { render, screen, fireEvent } from '@testing-library/react'
import FilterSection from '@/components/FilterSection'
import { posthog } from '@/lib/posthog'
import { TodoFilters } from '@/types'

// Mock posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('FilterSection PostHog Tracking', () => {
  const mockFilters: TodoFilters = {
    tags: [],
    done: null,
  }

  const mockOnFiltersChange = jest.fn()
  const mockOnClearDeleted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ['work', 'home'],
    })
  })

  it('tracks filter_tag_added when adding filter tag', async () => {
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearDeleted={mockOnClearDeleted}
        deletedCount={0}
      />
    )

    const tagInput = screen.getByPlaceholderText('Filter by tags')
    fireEvent.change(tagInput, { target: { value: 'work' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(posthog.capture).toHaveBeenCalledWith('filter_tag_added', {
      tag: 'work',
      total_filter_tags: 1,
    })
  })

  it('tracks filter_done_toggled when toggling done filter', () => {
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearDeleted={mockOnClearDeleted}
        deletedCount={0}
      />
    )

    const doneCheckbox = screen.getByLabelText('done')
    fireEvent.click(doneCheckbox)

    expect(posthog.capture).toHaveBeenCalledWith('filter_done_toggled', {
      show_done_only: true,
    })
  })
})
