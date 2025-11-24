'use client'

import { useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { posthog } from '@/lib/posthog'

function AuthStartContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider')
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    if (provider && callbackUrl) {
      // Track OAuth redirect
      posthog.capture('oauth_redirect_started', {
        provider,
        callback_url: decodeURIComponent(callbackUrl),
      })
      
      // Start OAuth flow
      signIn(provider, {
        callbackUrl: decodeURIComponent(callbackUrl),
        redirect: true,
      })
    }
  }, [provider, callbackUrl])

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mb-4"></div>
        <p className="text-lg text-gray-700">Redirecting to {provider} authentication...</p>
      </div>
    </div>
  )
}

export default function AuthStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthStartContent />
    </Suspense>
  )
}

