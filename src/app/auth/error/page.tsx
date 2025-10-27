'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    
    switch (errorParam) {
      case 'AccessDenied':
        setError('Access denied. You may not be registered in our system. Please contact your administrator.')
        break
      case 'Configuration':
        setError('OAuth configuration error. Please contact your administrator.')
        break
      case 'Verification':
        setError('OAuth verification failed. Please try again.')
        break
      case 'Signin':
        setError('Sign in failed. Please try again or contact your administrator.')
        break
      case 'OAuthSignin':
        setError('OAuth sign in error. Please try again.')
        break
      case 'OAuthCallback':
        setError('OAuth callback error. Please try again.')
        break
      case 'OAuthCreateAccount':
        setError('Failed to create OAuth account.')
        break
      case 'EmailCreateAccount':
        setError('Failed to create email account.')
        break
      case 'Callback':
        setError('OAuth callback error. Please try again.')
        break
      case 'OAuthAccountNotLinked':
        setError('OAuth account not linked. Please contact your administrator.')
        break
      case 'EmailSignin':
        setError('Email sign in error.')
        break
      case 'CredentialsSignin':
        setError('Invalid credentials.')
        break
      case 'SessionRequired':
        setError('Session required. Please sign in.')
        break
      case 'MissingAlias':
        setError('Missing user alias. Please try again.')
        break
      case 'NoSession':
        setError('No active session. Please complete OAuth authorization first.')
        break
      case 'UserNotFound':
        setError('User not found. Please contact your administrator.')
        break
      case 'AlreadyAuthorized':
        setError('User is already authorized. You can now login.')
        break
      case 'ProviderMismatch':
        setError('OAuth provider mismatch. Please use the correct provider.')
        break
      case 'OAuthNotCompleted':
        setError('OAuth authorization not completed. Please try again.')
        break
      case 'InternalError':
        setError('Internal server error. Please try again or contact your administrator.')
        break
      default:
        setError('An unknown authentication error occurred. Please try again.')
    }
  }, [searchParams])

  const handleRetry = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              If the problem persists, please contact your administrator.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Need help? Contact your system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
