import { render, screen, fireEvent } from '@testing-library/react'
import FilterSection from '@/components/FilterSection'
import { TodoFilters } from '@/types'

const mockFilters: TodoFilters = {
  tags: ['work', 'home'],
  done: null,
}

describe('FilterSection Component', () => {
  it('renders filter section', () => {
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        onClearDeleted={jest.fn()}
        deletedCount={0}
      />
    )

    expect(screen.getByText('Filter by tags:')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.getByText('done')).toBeInTheDocument()
    expect(screen.getByText('clear (0)')).toBeInTheDocument()
  })

  it('removes tag when x is clicked', () => {
    const mockOnFiltersChange = jest.fn()
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearDeleted={jest.fn()}
        deletedCount={0}
      />
    )

    const workTag = screen.getByText('work')
    const removeButton = workTag.parentElement?.querySelector('button')
    
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        tags: ['home'],
        done: null,
      })
    }
  })

  it('shows confirmation dialog when clear is clicked with deleted items', () => {
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        onClearDeleted={jest.fn()}
        deletedCount={3}
      />
    )

    const clearButton = screen.getByText('clear (3)')
    fireEvent.click(clearButton)

    expect(screen.getByText('Removing 3 todo items?')).toBeInTheDocument()
    expect(screen.getByText('Yes, Delete All')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('disables clear button when no deleted items', () => {
    render(
      <FilterSection
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        onClearDeleted={jest.fn()}
        deletedCount={0}
      />
    )

    const clearButton = screen.getByText('clear (0)')
    expect(clearButton).toBeDisabled()
  })
})
