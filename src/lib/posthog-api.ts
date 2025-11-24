// PostHog API client for server-side data fetching
// Note: This requires POSTHOG_API_KEY and POSTHOG_PROJECT_ID environment variables

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

export interface PostHogEvent {
  event: string
  timestamp: string
  properties: Record<string, any>
}

export interface PostHogInsight {
  labels: string[]
  data: number[]
}

async function fetchFromPostHog(endpoint: string, params: Record<string, any> = {}) {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    throw new Error('PostHog API credentials not configured')
  }

  const url = new URL(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`PostHog API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getEventCount(eventName: string, days: number = 7): Promise<number> {
  try {
    const data = await fetchFromPostHog('/insights', {
      insight: 'TRENDS',
      events: JSON.stringify([{ id: eventName, name: eventName, type: 'events' }]),
      date_from: `-${days}d`,
    })
    return data?.result?.[0]?.data?.[0] || 0
  } catch (error) {
    console.error('Error fetching event count:', error)
    return 0
  }
}

export async function getDailyActiveUsers(days: number = 7): Promise<PostHogInsight> {
  try {
    const data = await fetchFromPostHog('/insights', {
      insight: 'TRENDS',
      events: JSON.stringify([{ id: '$pageview', name: '$pageview', type: 'events' }]),
      date_from: `-${days}d`,
      interval: 'day',
    })
    
    const result = data?.result?.[0]
    return {
      labels: result?.labels || [],
      data: result?.data || [],
    }
  } catch (error) {
    console.error('Error fetching DAU:', error)
    return { labels: [], data: [] }
  }
}

export async function getRegistrationFunnel(): Promise<Record<string, number>> {
  try {
    const events = [
      'registration_started',
      'registration_form_submitted',
      'oauth_redirect_started',
      'registration_completed',
    ]
    
    const counts: Record<string, number> = {}
    for (const event of events) {
      counts[event] = await getEventCount(event, 30)
    }
    
    return counts
  } catch (error) {
    console.error('Error fetching registration funnel:', error)
    return {}
  }
}

export async function getTodoOperationsStats(): Promise<Record<string, number>> {
  try {
    const events = [
      'todo_created',
      'todo_completed',
      'todo_deleted',
      'todo_updated',
    ]
    
    const stats: Record<string, number> = {}
    for (const event of events) {
      stats[event] = await getEventCount(event, 7)
    }
    
    return stats
  } catch (error) {
    console.error('Error fetching todo operations:', error)
    return {}
  }
}
