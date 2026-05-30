import { getProgramPhase } from '@/lib/gamification/phases'

const PHASE_STYLES = [
  { background: 'rgba(29,158,117,0.2)',  color: '#2ECC8A' },  // phase 1
  { background: 'rgba(224,168,0,0.2)',   color: '#E0A800' },  // phase 2
  { background: 'rgba(255,229,102,0.2)', color: '#FFE566' },  // phase 3
]

export default function PhaseIndicator({ createdAt }: { createdAt: string }) {
  const phase = getProgramPhase(createdAt)
  const style = PHASE_STYLES[phase.phase - 1]
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight"
      style={{ background: style.background, color: style.color }}
    >
      Fase {phase.phase}
    </span>
  )
}
