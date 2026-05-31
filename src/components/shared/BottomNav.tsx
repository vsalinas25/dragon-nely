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
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div style={{ height: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: '#092920',
          borderTop: '0.5px solid rgba(29, 158, 117, 0.3)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-stretch w-full" style={{ height: 72 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all active:opacity-70"
              >
                {/* Active indicator dot */}
                {active && (
                  <div
                    className="absolute"
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#FFE566',
                      marginTop: -28,
                    }}
                  />
                )}

                {/* Icon container */}
                <div
                  className="flex items-center justify-center rounded-2xl transition-all"
                  style={{
                    width: 48,
                    height: 32,
                    background: active ? 'rgba(255,229,102,0.12)' : 'transparent',
                  }}
                >
                  <Icon
                    style={{
                      width: 26,
                      height: 26,
                      color: active ? '#FFE566' : 'rgba(240,255,248,0.45)',
                      strokeWidth: active ? 2.5 : 1.75,
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 700 : 400,
                    color: active ? '#FFE566' : 'rgba(240,255,248,0.45)',
                    letterSpacing: active ? '0.3px' : '0px',
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
