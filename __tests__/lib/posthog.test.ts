// Mock posthog-js before importing
const mockPostHogInstance = {
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  debug: jest.fn(),
}

jest.mock('posthog-js', () => {
  return {
    __esModule: true,
    default: mockPostHogInstance,
  }
})

describe('PostHog Client', () => {
  const originalEnv = process.env
  const originalWindow = global.window

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete (global as any).window
  })

  afterEach(() => {
    process.env = originalEnv
    global.window = originalWindow
  })

  it('should not initialize on server side', () => {
    // Simulate server-side (no window)
    delete (global as any).window
    jest.clearAllMocks()
    
    // Re-import to test server-side behavior
    jest.resetModules()
    require('@/lib/posthog')
    
    // posthog.init should not be called on server
    expect(mockPostHogInstance.init).not.toHaveBeenCalled()
  })

  it('should initialize with correct config when key is provided', () => {
    // Simulate client-side
    global.window = {} as any
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com'
    jest.clearAllMocks()

    jest.resetModules()
    require('@/lib/posthog')

    expect(mockPostHogInstance.init).toHaveBeenCalledWith('test-key', expect.objectContaining({
      api_host: 'https://test.posthog.com',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
    }))
  })

  it('should use default host when not provided', () => {
    global.window = {} as any
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST
    jest.clearAllMocks()

    jest.resetModules()
    require('@/lib/posthog')

    expect(mockPostHogInstance.init).toHaveBeenCalledWith('test-key', expect.objectContaining({
      api_host: 'https://app.posthog.com',
    }))
  })

  it('should export posthog instance', () => {
    global.window = {} as any
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    jest.clearAllMocks()

    jest.resetModules()
    const { posthog } = require('@/lib/posthog')

    expect(posthog).toBeDefined()
  })
})
