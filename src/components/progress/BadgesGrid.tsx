import { cn } from '@/lib/utils'
import { BADGE_DEFINITIONS } from '@/types'
import type { BadgeType } from '@/types'

interface Props {
  earned: BadgeType[]
}

export default function BadgesGrid({ earned }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {BADGE_DEFINITIONS.map((def) => {
        const isEarned = earned.includes(def.type)
        return (
          <div
            key={def.type}
            className={cn(
              'rounded-xl p-3 border flex items-start gap-3 transition-all',
              isEarned
                ? `${def.color} border-transparent`
                : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
            )}
          >
            <span className="text-2xl flex-shrink-0">{def.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">{def.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{def.description}</p>
              {isEarned && (
                <span className="text-[9px] font-semibold text-green-600 mt-1 block">✓ Conquistado</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
