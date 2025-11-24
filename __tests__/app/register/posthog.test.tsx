import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/register/page'
import { posthog } from '@/lib/posthog'

// Mock posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Registration PostHog Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('tracks registration_started when provider changes', () => {
    render(<RegisterPage />)
    
    const providerSelect = screen.getByLabelText(/登入方式/i)
    fireEvent.change(providerSelect, { target: { value: 'github' } })

    expect(posthog.capture).toHaveBeenCalledWith('registration_started', {
      provider: 'github',
    })
  })

  it('tracks registration_form_submitted on form submit', async () => {
    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authUrl: 'https://test.com/auth' }),
    })

    render(<RegisterPage />)
    
    const aliasInput = screen.getByLabelText(/使用者名稱/i)
    const submitButton = screen.getByText('註冊')

    fireEvent.change(aliasInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('registration_form_submitted', {
        alias: 'testuser',
        provider: 'google',
        alias_length: 8,
      })
    })
  })

  it('tracks registration_failed on error', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Alias already exists' }),
    })

    render(<RegisterPage />)
    
    const aliasInput = screen.getByLabelText(/使用者名稱/i)
    const submitButton = screen.getByText('註冊')

    fireEvent.change(aliasInput, { target: { value: 'existing' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('registration_failed', {
        error_type: 'alias_exists',
        alias: 'existing',
        provider: 'google',
      })
    })
  })
})
