'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { WeightLog } from '@/types'

export default function WeightChart({ logs }: { logs: WeightLog[] }) {
  if (logs.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400 bg-gray-50 rounded-xl">
        Adicione pelo menos 2 registros para ver o gráfico
      </div>
    )
  }

  const data = logs.map((l) => ({
    date: format(parseISO(l.logged_at), 'dd/MM', { locale: ptBR }),
    peso: Number(l.weight_kg),
  }))

  const weights = data.map((d) => d.peso)
  const min = Math.min(...weights) - 1
  const max = Math.max(...weights) + 1

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <YAxis domain={[min, max]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: number) => [`${v} kg`, 'Peso']}
        />
        <Line
          type="monotone"
          dataKey="peso"
          stroke="#4CAF50"
          strokeWidth={2.5}
          dot={{ fill: '#4CAF50', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
