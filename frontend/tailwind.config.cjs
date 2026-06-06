/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0A0B14',
          surface:  '#111320',
          elevated: '#1A1D2E',
        },
        border: {
          DEFAULT: '#252840',
          glow:    '#4F63FF33',
        },
        gold: {
          DEFAULT: '#E8B84B',
          light:   '#F5D07A',
          dark:    '#C49A2E',
        },
        electric: {
          DEFAULT: '#4F63FF',
          glow:    '#4F63FF44',
        },
        primary:   '#E8B84B',
        secondary: '#4F63FF',
        emerald:   '#10B981',
        rose:      '#F43F5E',
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'glow-gold':     '0 0 20px rgba(232, 184, 75, 0.25)',
        'glow-electric': '0 0 20px rgba(79, 99, 255, 0.25)',
        'card':          '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':    '0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-gold':     'linear-gradient(135deg, #E8B84B 0%, #F5D07A 100%)',
        'gradient-electric': 'linear-gradient(135deg, #4F63FF 0%, #7C8FFF 100%)',
        'gradient-dark':     'linear-gradient(180deg, #0A0B14 0%, #111320 100%)',
        'hero-overlay':      'linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(17,19,32,0.80) 100%)',
      },
      animation: {
        'float':      'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float:     { '0%,100%': { transform: 'translateY(0)' },      '50%': { transform: 'translateY(-8px)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 15px rgba(232,184,75,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(232,184,75,0.5)' } },
        slideUp:   { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
