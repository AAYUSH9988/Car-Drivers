/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          void:          '#F1F5F9',
          bg:            '#F8FAFC',
          sidebar:       '#FFFFFF',
          surface:       '#FFFFFF',
          elevated:      '#F1F5F9',
          hover:         '#E2E8F0',
          border:        '#E2E8F0',
          'border-alt':  '#CBD5E1',
          accent:        '#2563EB',
          'accent-dim':  '#1D4ED8',
          gold:          '#D97706',
          'text-1':      '#0F172A',
          'text-2':      '#475569',
          'text-3':      '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      animation: {
        'fade-in':  'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
};
