'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

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
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Background photo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/familia.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
        }}
      >
        {/* Gradient overlay — transparent at top, dark green at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(9,41,32,0.15) 0%, rgba(9,41,32,0.5) 40%, rgba(9,41,32,0.92) 65%, #092920 80%)',
          }}
        />
      </div>

      {/* Logo pill — top center */}
      <div className="relative z-10 flex justify-center pt-12">
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #0D3B2E, #1A5C42)',
            border: '1px solid rgba(224,168,0,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Dragon icon */}
          <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE566"/>
                <stop offset="100%" stopColor="#E0A800"/>
              </linearGradient>
              <linearGradient id="lg-body" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2ECC8A"/>
                <stop offset="100%" stopColor="#1A8F60"/>
              </linearGradient>
            </defs>
            <ellipse cx="60" cy="76" rx="30" ry="32" fill="url(#lg-body)"/>
            <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="#2ECC8A"/>
            <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="url(#lg-gold)" fillOpacity="0.5"/>
            <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="#2ECC8A"/>
            <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="url(#lg-gold)" fillOpacity="0.5"/>
            <ellipse cx="48" cy="68" rx="10" ry="11" fill="white"/>
            <ellipse cx="72" cy="68" rx="10" ry="11" fill="white"/>
            <ellipse cx="49" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
            <ellipse cx="71" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
            <ellipse cx="47" cy="68" rx="2" ry="2" fill="white"/>
            <ellipse cx="69" cy="68" rx="2" ry="2" fill="white"/>
            <ellipse cx="42" cy="80" rx="5" ry="3" fill="#E0A800"/>
            <ellipse cx="78" cy="80" rx="5" ry="3" fill="#E0A800"/>
          </svg>
          <span
            className="font-black tracking-wide"
            style={{
              fontSize: 20,
              background: 'linear-gradient(180deg, #FFE566 0%, #E0A800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '1px',
            }}
          >
            DRAGON NELY
          </span>
        </div>
      </div>

      {/* Spacer — pushes form to bottom */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-6 pb-10 space-y-6">
        {/* Family label + tagline */}
        <div className="text-center space-y-1">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#2ECC8A' }}
          >
            Família Knauft
          </p>
          <p
            className="text-base italic font-medium"
            style={{ color: 'rgba(240,255,248,0.85)' }}
          >
            Porque se não chegar na meta, vai ter hein...
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black" style={{ color: '#F0FFF8' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm font-medium" style={{ color: '#2ECC8A' }}>
            Faça login para continuar seu streak 🔥
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          {/* Email */}
          <div
            className="flex items-center gap-3 px-4 rounded-2xl"
            style={{
              background: 'rgba(13,59,46,0.7)',
              border: '1px solid rgba(46,204,138,0.25)',
              backdropFilter: 'blur(10px)',
              height: 56,
            }}
          >
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#2ECC8A' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: '#F0FFF8' }}
            />
          </div>

          {/* Password */}
          <div
            className="flex items-center gap-3 px-4 rounded-2xl"
            style={{
              background: 'rgba(13,59,46,0.7)',
              border: '1px solid rgba(46,204,138,0.25)',
              backdropFilter: 'blur(10px)',
              height: 56,
            }}
          >
            <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#2ECC8A' }} />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Senha"
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: '#F0FFF8' }}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="flex-shrink-0">
              {showPwd
                ? <EyeOff className="w-5 h-5" style={{ color: 'rgba(240,255,248,0.4)' }} />
                : <Eye    className="w-5 h-5" style={{ color: 'rgba(240,255,248,0.4)' }} />
              }
            </button>
          </div>

          {error && (
            <p
              className="text-sm text-center rounded-xl px-4 py-2"
              style={{ background: 'rgba(231,76,60,0.2)', color: '#FF8A80' }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-black text-lg rounded-2xl transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              height: 56,
              background: 'linear-gradient(135deg, #2ECC8A, #1D9E75)',
              color: '#0D3B2E',
              boxShadow: '0 4px 20px rgba(46,204,138,0.35)',
            }}
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando…</> : 'Entrar'}
          </button>
        </form>

        {/* Forgot password */}
        <p className="text-center text-sm" style={{ color: 'rgba(240,255,248,0.5)' }}>
          Esqueci minha senha
        </p>

        {/* Feature icons */}
        <div
          className="grid grid-cols-3 pt-2"
          style={{ borderTop: '0.5px solid rgba(46,204,138,0.15)' }}
        >
          {[
            { icon: '🥗', label: 'Saúde' },
            { icon: '👨‍👩‍👧‍👦', label: 'Família' },
            { icon: '💪', label: 'Evolução' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 py-3">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,255,248,0.6)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
