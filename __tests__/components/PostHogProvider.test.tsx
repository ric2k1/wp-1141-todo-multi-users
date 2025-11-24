import { render } from '@testing-library/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider } from '@/components/PostHogProvider'
import { posthog } from '@/lib/posthog'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
  },
}))

describe('PostHogProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('renders children', () => {
    const { getByText } = render(
      <PostHogProvider>
        <div>Test Content</div>
      </PostHogProvider>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('tracks pageview on mount', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/test-page')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    )

    expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: expect.stringContaining('/test-page'),
    })
  })

  it('tracks pageview with query params', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/test')
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('?param=value')
    )

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    )

    expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: expect.stringContaining('/test?param=value'),
    })
  })
})
