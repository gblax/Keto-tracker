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
          DEFAULT: '#fafaf9',
          elevated: '#ffffff',
          card: '#f5f5f4',
          hero: '#f7f7f5',
        },
        border: {
          DEFAULT: '#e7e5e4',
          strong: '#d6d3d1',
          subtle: '#f2f2f0',
        },
        fg: {
          DEFAULT: '#0c0a09',
          muted: '#57534e',
          hint: '#78716c',
          subtle: '#a8a29e',
        },
        ketosis: {
          good: '#10b981',
          goodEnd: '#84cc16',
          goodSoft: '#d1fae5',
          goodDeep: '#047857',
          warn: '#d97706',
          warnSoft: '#fef3c7',
          bad: '#e11d48',
          badSoft: '#ffe4e6',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.08)',
        cardHover:
          '0 1px 2px rgba(15, 23, 42, 0.05), 0 20px 40px -16px rgba(15, 23, 42, 0.14)',
        float:
          '0 2px 4px rgba(15, 23, 42, 0.05), 0 24px 48px -20px rgba(15, 23, 42, 0.18)',
        ring: '0 12px 40px -20px rgba(16, 185, 129, 0.45)',
        tab: '0 2px 8px rgba(15, 23, 42, 0.06), 0 16px 36px -16px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
