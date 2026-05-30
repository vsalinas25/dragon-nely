// Dragon face icon — used in headers, loading screens, PWA
export default function DragonIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="di-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D3B2E"/>
          <stop offset="100%" stopColor="#092920"/>
        </linearGradient>
        <linearGradient id="di-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE566"/>
          <stop offset="100%" stopColor="#E0A800"/>
        </linearGradient>
        <linearGradient id="di-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2ECC8A"/>
          <stop offset="100%" stopColor="#1A8F60"/>
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="120" height="120" rx="26" fill="url(#di-bg)"/>
      <rect width="120" height="120" rx="26" fill="none" stroke="#E0A800" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* Body */}
      <ellipse cx="60" cy="76" rx="30" ry="32" fill="url(#di-body)"/>
      {/* Horns */}
      <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="#2ECC8A"/>
      <path d="M38 56 Q28 42 34 32 Q40 24 46 32 Q43 42 46 52 Z" fill="url(#di-gold)" fillOpacity="0.5"/>
      <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="#2ECC8A"/>
      <path d="M82 56 Q92 42 86 32 Q80 24 74 32 Q77 42 74 52 Z" fill="url(#di-gold)" fillOpacity="0.5"/>
      {/* Eyes */}
      <ellipse cx="48" cy="68" rx="10" ry="11" fill="white"/>
      <ellipse cx="72" cy="68" rx="10" ry="11" fill="white"/>
      <ellipse cx="49" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
      <ellipse cx="71" cy="70" rx="6" ry="7" fill="#0D3B2E"/>
      <ellipse cx="47" cy="68" rx="2" ry="2" fill="white"/>
      <ellipse cx="69" cy="68" rx="2" ry="2" fill="white"/>
      {/* Cheeks */}
      <ellipse cx="42" cy="80" rx="5" ry="3" fill="#E0A800"/>
      <ellipse cx="78" cy="80" rx="5" ry="3" fill="#E0A800"/>
      {/* Mouth */}
      <path d="M46 88 Q60 96 74 88 Q70 104 60 107 Q50 104 46 88 Z" fill="white"/>
      {/* Tail tip */}
      <path d="M60 105 Q54 114 50 120 L60 116 L70 120 Q66 114 60 105 Z" fill="url(#di-gold)"/>
    </svg>
  )
}
