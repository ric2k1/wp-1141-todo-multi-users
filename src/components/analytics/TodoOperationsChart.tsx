'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TodoOperationsChartProps {
  data?: Record<string, number>
}

export default function TodoOperationsChart({ data }: TodoOperationsChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  const chartData = [
    {
      name: 'Operations',
      Created: data.todo_created || 0,
      Completed: data.todo_completed || 0,
      Updated: data.todo_updated || 0,
      Deleted: data.todo_deleted || 0,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Created" fill="#10b981" />
        <Bar dataKey="Completed" fill="#3b82f6" />
        <Bar dataKey="Updated" fill="#f59e0b" />
        <Bar dataKey="Deleted" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
