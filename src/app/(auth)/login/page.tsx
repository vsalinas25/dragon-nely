'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import DragonIcon from '@/components/brand/DragonIcon'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0D3B2E' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5 animate-dragon-breathe">
            <DragonIcon size={88} />
          </div>
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: 36,
              background: 'linear-gradient(180deg, #FFE566 0%, #E0A800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}
          >
            DRAGON
          </h1>
          <h2
            className="font-black tracking-widest"
            style={{ fontSize: 24, color: '#F0FFF8', letterSpacing: '8px' }}
          >
            NELY
          </h2>
          <p className="text-sm mt-3" style={{ color: '#6DD4A8' }}>
            Porque se não chegar na meta, vai ter hein...
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid rgba(29,158,117,0.4)',
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A8F0D0' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: '#092920',
                border: '1px solid rgba(29,158,117,0.5)',
                color: '#F0FFF8',
              }}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A8F0D0' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: '#092920',
                border: '1px solid rgba(29,158,117,0.5)',
                color: '#F0FFF8',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3"
              style={{ background: 'rgba(231,76,60,0.15)', color: '#FF6B6B', border: '1px solid rgba(231,76,60,0.3)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: '#1D9E75', color: '#F0FFF8' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar 🐉'
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(168,240,208,0.5)' }}>
          Família · Saúde · Evolução
        </p>
      </div>
    </div>
  )
}
