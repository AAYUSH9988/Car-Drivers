/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          void:          '#080A0F',
          bg:            '#0C0E14',
          sidebar:       '#090B10',
          surface:       '#13161F',
          elevated:      '#1A1E2E',
          hover:         '#1F2335',
          border:        '#232840',
          'border-alt':  '#2E3554',
          accent:        '#5B6CF9',
          'accent-dim':  '#4A5AE8',
          gold:          '#E8B84B',
          'text-1':      '#F1F5F9',
          'text-2':      '#94A3B8',
          'text-3':      '#475569',
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
