'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DailyActiveUsers from '@/components/analytics/DailyActiveUsers'
import RegistrationFunnel from '@/components/analytics/RegistrationFunnel'
import TodoOperationsChart from '@/components/analytics/TodoOperationsChart'

interface AnalyticsData {
  configured: boolean
  dailyActiveUsers?: {
    labels: string[]
    data: number[]
  }
  registrationFunnel?: Record<string, number>
  todoOperations?: Record<string, number>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const analyticsData = await response.json()
        setData(analyticsData)
        if (!analyticsData.configured) {
          setError('PostHog API not configured. Please set POSTHOG_API_KEY and POSTHOG_PROJECT_ID environment variables.')
        }
      } catch (err) {
        setError('Failed to load analytics data')
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-lg text-gray-700">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-7xl mx-auto p-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">Analytics Dashboard</h1>
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Todos
          </Link>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">{error}</p>
            <p className="text-sm text-yellow-700 mt-2">
              Analytics will work once PostHog API credentials are configured in your environment variables.
            </p>
          </div>
        )}

        {data?.configured && (
          <div className="space-y-6">
            <div className="bg-white border border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Daily Active Users</h2>
              <DailyActiveUsers data={data.dailyActiveUsers} />
            </div>

            <div className="bg-white border border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Registration Funnel</h2>
              <RegistrationFunnel data={data.registrationFunnel} />
            </div>

            <div className="bg-white border border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Todo Operations</h2>
              <TodoOperationsChart data={data.todoOperations} />
            </div>
          </div>
        )}

        {!data?.configured && !error && (
          <div className="bg-white border border-black rounded-lg p-8 text-center">
            <p className="text-gray-600">No analytics data available. Please configure PostHog API.</p>
          </div>
        )}
      </div>
    </div>
  )
}
