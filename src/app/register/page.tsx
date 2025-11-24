'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [alias, setAlias] = useState('')
  const [provider, setProvider] = useState<'google' | 'github' | 'facebook'>('google')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!alias.trim()) {
      setError('请输入用户名')
      return
    }

    // Validate alias format (alphanumeric and underscore, 3-20 chars)
    const aliasRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!aliasRegex.test(alias.trim())) {
      setError('用户名只能包含字母、数字和下划线，长度 3-20 个字符')
      return
    }

    setLoading(true)
    setError('')

    try {
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
        if (response.status === 409) {
          setError('该用户名已被使用，请选择其他用户名')
        } else {
          setError(data.error || '注册失败，请稍后再试')
        }
        setLoading(false)
        return
      }

      // Redirect to OAuth authorization URL
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('无法获取授权链接，请稍后再试')
        setLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('发生错误，请稍后再试')
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
          <p className="text-gray-600">创建新账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入用户名（3-20 个字符）"
              disabled={loading}
              pattern="[a-zA-Z0-9_]{3,20}"
              title="用户名只能包含字母、数字和下划线，长度 3-20 个字符"
            />
            <p className="mt-1 text-xs text-gray-500">
              只能包含字母、数字和下划线，长度 3-20 个字符
            </p>
          </div>

          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
              登录方式
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
              选择您要使用的 OAuth 登录方式
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
            {loading ? '处理中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            已有账户？{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              立即登录
            </Link>
          </p>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-700">
            <strong>注意：</strong>注册后，您将被重定向到 {provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Facebook'} 进行授权。
            授权完成后即可使用该账户登录。
          </p>
        </div>
      </div>
    </div>
  )
}
