// Compact horizontal logo for mobile headers — wrapped in dark pill for contrast
export default function DragonLogoHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: '#0D3B2E' }}
    >
      {/* Mini dragon icon */}
      <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lh-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE566"/>
            <stop offset="100%" stopColor="#E0A800"/>
          </linearGradient>
          <linearGradient id="lh-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2ECC8A"/>
            <stop offset="100%" stopColor="#1A8F60"/>
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="76" rx="30" ry="32" fill="url(#lh-body)"/>
        <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="#2ECC8A"/>
        <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="url(#lh-gold)" fillOpacity="0.5"/>
        <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="#2ECC8A"/>
        <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="url(#lh-gold)" fillOpacity="0.5"/>
        <ellipse cx="48" cy="68" rx="10" ry="11" fill="white"/>
        <ellipse cx="72" cy="68" rx="10" ry="11" fill="white"/>
        <ellipse cx="49" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
        <ellipse cx="71" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
        <ellipse cx="47" cy="68" rx="2" ry="2" fill="white"/>
        <ellipse cx="69" cy="68" rx="2" ry="2" fill="white"/>
        <ellipse cx="42" cy="80" rx="5" ry="3" fill="#E0A800"/>
        <ellipse cx="78" cy="80" rx="5" ry="3" fill="#E0A800"/>
        <path d="M60 105 Q54 114 50 120 L60 116 L70 120 Q66 114 60 105 Z" fill="url(#lh-gold)"/>
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-black"
            style={{
              fontSize: 14,
              background: 'linear-gradient(180deg, #FFE566 0%, #E0A800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.3px',
            }}
          >
            DRAGON
          </span>
          <span
            className="font-black"
            style={{ fontSize: 10, color: '#F0FFF8', letterSpacing: '3px' }}
          >
            NELY
          </span>
        </div>
      </div>
    </div>
    <span
      style={{ fontSize: 9, color: '#1D9E75', letterSpacing: '0.2px', fontStyle: 'italic' }}
    >
      Porque se não chegar na meta, vai ter hein...
    </span>
    </div>
  )
}
