import posthog from 'posthog-js'

// Initialize PostHog only on the client side
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      },
      // Disable autocapture for privacy
      autocapture: false,
      // Capture pageviews automatically
      capture_pageview: true,
      // Capture pageleaves automatically
      capture_pageleave: true,
    })
  } else {
    console.warn('PostHog key not found. Analytics will not be tracked.')
  }
}

export { posthog }
