'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SetupCompletePage() {
  const searchParams = useSearchParams()
  const [alias, setAlias] = useState<string | null>(null)

  useEffect(() => {
    setAlias(searchParams.get('alias'))
  }, [searchParams])

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authorization Complete!
          </h1>
          
          <p className="text-gray-600 mb-6">
            User <strong>{alias}</strong> has been successfully authorized and can now login to the Todo Multi-Users application.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• The user can now login using their alias: <strong>{alias}</strong></li>
              <li>• They will be redirected to their OAuth provider when logging in</li>
              <li>• Sessions will be maintained until they expire</li>
              <li>• No need to go through OAuth again unless session expires</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            You can close this window now. The user setup is complete.
          </p>
        </div>
      </div>
    </div>
  )
}
