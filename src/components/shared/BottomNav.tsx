'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, TrendingUp, Flame, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Início',    icon: Home       },
  { href: '/rankings',   label: 'Ranking',   icon: Trophy     },
  { href: '/progress',   label: 'Progresso', icon: TrendingUp },
  { href: '/challenges', label: 'Desafios',  icon: Flame      },
  { href: '/feed',       label: 'Feed',      icon: Newspaper  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 safe-area-bottom z-50"
      style={{
        background: '#092920',
        borderTop: '0.5px solid rgba(29, 158, 117, 0.3)',
        height: 64,
      }}
    >
      <div className="max-w-md mx-auto flex items-stretch h-full">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-all"
            >
              <div className={cn(
                'w-7 h-7 flex items-center justify-center rounded-lg transition-all',
                active && 'scale-110'
              )}>
                <Icon
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: active ? '#FFE566' : 'rgba(240,255,248,0.4)' }}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{
                  color: active ? '#FFE566' : 'rgba(240,255,248,0.4)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
