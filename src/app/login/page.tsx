'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { posthog } from '@/lib/posthog'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('請輸入使用者名稱')
      return
    }

    setLoading(true)
    setError('')

    // Track login attempt
    posthog.capture('login_attempted', {
      username: username.trim(),
    })

    try {
      // Look up user in database to find their provider
      const response = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorType = response.status === 404 ? 'user_not_found' : 'lookup_failed'
        posthog.capture('login_failed', {
          error_type: errorType,
          username: username.trim(),
        })
        
        if (response.status === 404) {
          setError('使用者不存在。請先註冊帳戶。')
        } else {
          setError(data.error || '查詢使用者失敗')
        }
        setLoading(false)
        return
      }

      // Track successful login lookup
      posthog.capture('login_successful', {
        username: username.trim(),
        provider: data.provider,
      })

      // Redirect to OAuth provider
      const result = await signIn(data.provider, {
        callbackUrl: '/',
        redirect: false,
      })

      if (result?.error) {
        posthog.capture('login_failed', {
          error_type: 'auth_failed',
          username: username.trim(),
          provider: data.provider,
        })
        setError('認證失敗，請重試')
        setLoading(false)
      } else if (result?.url) {
        // Redirect to OAuth provider
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('發生錯誤，請重試')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            todo list
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入使用者名稱"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '查詢使用者中...' : '登入'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            還沒有帳戶？{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              立即註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}