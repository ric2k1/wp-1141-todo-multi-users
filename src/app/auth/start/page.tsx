'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function AuthStartPage() {
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider')
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    if (provider && callbackUrl) {
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

