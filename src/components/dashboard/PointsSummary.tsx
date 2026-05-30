import ActivityRing from '@/components/shared/ActivityRing'
import { formatPoints } from '@/lib/utils'

interface Props {
  todayPoints: number
  weekPoints: number
  monthPoints: number
  totalPoints: number
}

const MAX_DAILY  = 48
const MAX_WEEKLY = 48 * 7

export default function PointsSummary({ todayPoints, weekPoints, monthPoints, totalPoints }: Props) {
  return (
    <div className="ios-card p-5">
      <p className="ios-section-label">Pontos</p>

      {/* Three rings row */}
      <div className="flex items-center justify-around mt-1">
        <RingStat label="Hoje"   value={todayPoints}  progress={(todayPoints / MAX_DAILY) * 100}           color="#2ECC8A" />
        <RingStat label="Semana" value={weekPoints}   progress={(weekPoints / MAX_WEEKLY) * 100}           color="#1D9E75" />
        <RingStat label="Mês"   value={monthPoints}  progress={Math.min(100, (monthPoints / 500) * 100)} color="#E0A800" />
      </div>

      {/* Total */}
      <div
        className="mt-4 pt-4 flex items-center justify-between"
        style={{ borderTop: '0.5px solid rgba(29,158,117,0.2)' }}
      >
        <p className="text-sm font-medium" style={{ color: '#1D9E75' }}>Total acumulado</p>
        <p className="text-2xl font-black tabular-nums" style={{ color: '#0D3B2E' }}>
          {formatPoints(totalPoints)}
        </p>
      </div>
    </div>
  )
}

function RingStat({ label, value, progress, color }: {
  label: string; value: number; progress: number; color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ActivityRing progress={progress} color={color} trackColor="rgba(29,158,117,0.1)" size={72} strokeWidth={8}>
        <span className="text-[15px] font-black tabular-nums" style={{ color: '#0D3B2E' }}>
          {formatPoints(value)}
        </span>
      </ActivityRing>
      <span className="text-[11px] font-semibold" style={{ color: '#1D9E75' }}>{label}</span>
    </div>
  )
}
