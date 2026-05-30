'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { Measurement } from '@/types'

export default function MeasurementsChart({ logs }: { logs: Measurement[] }) {
  if (logs.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400 bg-gray-50 rounded-xl">
        Adicione medidas para ver o gráfico
      </div>
    )
  }

  const data = logs.map((l) => ({
    date: format(parseISO(l.logged_at), 'dd/MM'),
    cintura: l.waist_cm ?? undefined,
    quadril: l.hip_cm ?? undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: number, name: string) => [`${v} cm`, name === 'cintura' ? 'Cintura' : 'Quadril']}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="cintura" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
        <Line type="monotone" dataKey="quadril" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
