import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dragon: {
          deep:          '#0D3B2E',
          dark:          '#092920',
          mid:           '#1D9E75',
          bright:        '#2ECC8A',
          mint:          '#A8F0D0',
          white:         '#F0FFF8',
          light:         '#F8FEFB',
          gold:          '#E0A800',
          'gold-bright': '#FFE566',
          'gold-dark':   '#A87200',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '16px',
        button: '12px',
        badge: '20px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.15)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.05)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'winner-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224,168,0,0)' },
          '50%':      { boxShadow: '0 0 24px 8px rgba(224,168,0,0.4)' },
        },
        'crown-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        'podium-rise': {
          from: { transform: 'scaleY(0)', opacity: '0' },
          to:   { transform: 'scaleY(1)', opacity: '1' },
        },
        'rank-shine': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'dragon-breathe': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.75', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'streak-pulse':    'streak-pulse 0.6s ease-in-out',
        'bounce-in':       'bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'slide-up':        'slide-up 0.3s ease-out',
        'winner-glow':     'winner-glow 2.5s ease-in-out infinite',
        'crown-float':     'crown-float 1.8s ease-in-out infinite',
        'podium-rise':     'podium-rise 0.5s ease-out',
        'rank-shine':      'rank-shine 2s linear infinite',
        'dragon-breathe':  'dragon-breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
