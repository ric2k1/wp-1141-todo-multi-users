import { NextResponse } from 'next/server'
import { getDailyActiveUsers, getRegistrationFunnel, getTodoOperationsStats } from '@/lib/posthog-api'

export async function GET() {
  try {
    // Check if PostHog API is configured
    if (!process.env.POSTHOG_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
      return NextResponse.json({
        error: 'PostHog API not configured',
        configured: false,
      }, { status: 503 })
    }

    const [dau, funnel, todoStats] = await Promise.all([
      getDailyActiveUsers(7),
      getRegistrationFunnel(),
      getTodoOperationsStats(),
    ])

    return NextResponse.json({
      configured: true,
      dailyActiveUsers: dau,
      registrationFunnel: funnel,
      todoOperations: todoStats,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      configured: false,
    }, { status: 500 })
  }
}
