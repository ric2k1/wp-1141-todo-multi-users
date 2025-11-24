'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RegistrationFunnelProps {
  data?: Record<string, number>
}

export default function RegistrationFunnel({ data }: RegistrationFunnelProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  const chartData = [
    { name: 'Started', value: data.registration_started || 0 },
    { name: 'Form Submitted', value: data.registration_form_submitted || 0 },
    { name: 'OAuth Redirect', value: data.oauth_redirect_started || 0 },
    { name: 'Completed', value: data.registration_completed || 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
