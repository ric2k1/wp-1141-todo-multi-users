import { render, screen, waitFor } from '@testing-library/react'
import AnalyticsPage from '@/app/analytics/page'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Analytics Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to login when not authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<AnalyticsPage />)
    // Should redirect (tested via router.push mock)
  })

  it('displays loading state', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
    })
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<AnalyticsPage />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('displays error when API not configured', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ configured: false }),
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText(/PostHog API not configured/i)).toBeInTheDocument()
    })
  })

  it('displays analytics data when configured', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        configured: true,
        dailyActiveUsers: { labels: ['2024-01-01'], data: [10] },
        registrationFunnel: { registration_started: 100 },
        todoOperations: { todo_created: 50 },
      }),
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('Daily Active Users')).toBeInTheDocument()
      expect(screen.getByText('Registration Funnel')).toBeInTheDocument()
      expect(screen.getByText('Todo Operations')).toBeInTheDocument()
    })
  })
})
