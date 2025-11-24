import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  if (posthogClient) {
    return posthogClient
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (posthogKey) {
    posthogClient = new PostHog(posthogKey, {
      host: posthogHost,
    })
    return posthogClient
  }

  return null
}

// Shutdown function for graceful cleanup
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown()
    posthogClient = null
  }
}
