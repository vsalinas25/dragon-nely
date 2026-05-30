import DragonIcon from '@/components/brand/DragonIcon'

export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#0D3B2E' }}
    >
      <div className="animate-dragon-breathe">
        <DragonIcon size={96} />
      </div>

      <div className="text-center">
        <h1
          className="font-black tracking-tight"
          style={{
            fontSize: 32,
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
          style={{ fontSize: 20, color: '#F0FFF8', letterSpacing: '6px' }}
        >
          NELY
        </h2>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              background: '#1D9E75',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <p className="text-xs" style={{ color: '#6DD4A8' }}>
        Porque se não chegar na meta, vai ter hein...
      </p>
    </div>
  )
}
