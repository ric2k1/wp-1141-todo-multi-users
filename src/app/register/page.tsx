'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { posthog } from '@/lib/posthog'

export default function RegisterPage() {
  const [alias, setAlias] = useState('')
  const [provider, setProvider] = useState<'google' | 'github' | 'facebook'>('google')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Track when user starts registration (provider selection)
  useEffect(() => {
    posthog.capture('registration_started', {
      provider,
    })
  }, [provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!alias.trim()) {
      setError('請輸入使用者名稱')
      return
    }

    // Validate alias format (alphanumeric and underscore, 3-20 chars)
    const aliasRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!aliasRegex.test(alias.trim())) {
      setError('使用者名稱只能包含字母、數字和底線，長度 3-20 個字元')
      return
    }

    setLoading(true)
    setError('')

    // Track form submission
    posthog.capture('registration_form_submitted', {
      alias: alias.trim(),
      provider,
      alias_length: alias.trim().length,
    })

    try {
      // Track API call
      posthog.capture('registration_authorize_api_called', {
        alias: alias.trim(),
        provider,
      })

      // Call the authorization API
      const response = await fetch('/api/auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: alias.trim(),
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorType = response.status === 409 ? 'alias_exists' : response.status >= 500 ? 'server_error' : 'validation_error'
        posthog.capture('registration_failed', {
          error_type: errorType,
          alias: alias.trim(),
          provider,
        })
        
        if (response.status === 409) {
          setError('該使用者名稱已被使用，請選擇其他使用者名稱')
        } else {
          setError(data.error || '註冊失敗，請稍後再試')
        }
        setLoading(false)
        return
      }

      // Redirect to OAuth authorization URL
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('無法取得授權連結，請稍後再試')
        setLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('發生錯誤，請稍後再試')
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
          <p className="text-gray-600">建立新帳戶</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-2">
              使用者名稱
            </label>
            <input
              type="text"
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入使用者名稱（3-20 個字元）"
              disabled={loading}
              pattern="[a-zA-Z0-9_]{3,20}"
              title="使用者名稱只能包含字母、數字和底線，長度 3-20 個字元"
            />
            <p className="mt-1 text-xs text-gray-500">
              只能包含字母、數字和底線，長度 3-20 個字元
            </p>
          </div>

          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
              登入方式
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'google' | 'github' | 'facebook')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="google">Google</option>
              <option value="github">GitHub</option>
              <option value="facebook">Facebook</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              選擇您要使用的 OAuth 登入方式
            </p>
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
            {loading ? '處理中...' : '註冊'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            已有帳戶？{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              立即登入
            </Link>
          </p>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-700">
            <strong>注意：</strong>註冊後，您將被重新導向到 {provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Facebook'} 進行授權。
            授權完成後即可使用該帳戶登入。
          </p>
        </div>
      </div>
    </div>
  )
}
