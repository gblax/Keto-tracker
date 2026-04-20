import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter-tight)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0a',
          elevated: '#141414',
          card: '#1a1a1a',
        },
        border: {
          DEFAULT: '#262626',
          strong: '#333333',
        },
        fg: {
          DEFAULT: '#f5f5f5',
          muted: '#a3a3a3',
          subtle: '#737373',
        },
        ketosis: {
          good: '#34d399',
          goodEnd: '#a3e635',
          warn: '#f59e0b',
          bad: '#ef4444',
        },
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
