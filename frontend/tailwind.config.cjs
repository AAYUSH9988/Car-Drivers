/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern Editorial Design System Colors
        primary: '#000000',           // Ink
        'on-primary': '#ffffff',      // Paper
        'primary-container': '#1c1b1b',
        'on-primary-container': '#858383',
        'primary-fixed': '#e5e2e1',
        'primary-fixed-dim': '#c9c6c5',
        'on-primary-fixed': '#1c1b1b',
        'on-primary-fixed-variant': '#474646',

        secondary: '#5e5e5e',
        'on-secondary': '#ffffff',
        'secondary-container': '#e0dfdf',
        'on-secondary-container': '#626362',
        'secondary-fixed': '#e3e2e1',
        'secondary-fixed-dim': '#c7c6c5',
        'on-secondary-fixed': '#1a1c1c',
        'on-secondary-fixed-variant': '#464746',

        tertiary: '#000000',          // Oxblood (using black as base, will use custom oxblood)
        'on-tertiary': '#ffffff',
        'tertiary-container': '#3d0506',  // Oxblood
        'on-tertiary-container': '#c26b65',
        'tertiary-fixed': '#ffdad7',
        'tertiary-fixed-dim': '#ffb3ad',
        'on-tertiary-fixed': '#3d0506',
        'on-tertiary-fixed-variant': '#77302d',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Surface colors
        surface: '#fbf9f9',           // Paper
        'surface-dim': '#dbdad9',
        'surface-bright': '#fbf9f9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f3f3',
        'surface-container': '#efeded',
        'surface-container-high': '#e9e8e7',
        'surface-container-highest': '#e3e2e2',
        'surface-variant': '#e3e2e2',
        'surface-tint': '#5f5e5e',

        // Background
        background: '#fbf9f9',
        'on-background': '#1b1c1c',

        // On surfaces
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#444748',

        // Inverse
        'inverse-surface': '#303031',
        'inverse-on-surface': '#f2f0f0',
        'inverse-primary': '#c9c6c5',

        // Outline
        outline: '#747878',
        'outline-variant': '#c4c7c7',

        // Oxblood accent
        oxblood: '#4A0E0E',
        'oxblood-light': '#7a1e1e',
        'oxblood-lighter': '#a03030',
      },
      fontFamily: {
        'display-xl': ['Bodoni Moda', 'serif'],
        'display-lg': ['Bodoni Moda', 'serif'],
        'headline-lg': ['Bodoni Moda', 'serif'],
        'headline-lg-mobile': ['Bodoni Moda', 'serif'],
        'body-lg': ['Hanken Grotesk', 'sans-serif'],
        'body-md': ['Hanken Grotesk', 'sans-serif'],
        'ui-label': ['Space Mono', 'monospace'],
        'ui-button': ['Hanken Grotesk', 'sans-serif'],
        // Legacy support
        heading: ['Bodoni Moda', 'serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['120px', { lineHeight: '110px', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-lg': ['80px', { lineHeight: '84px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['48px', { lineHeight: '52px', fontWeight: '700' }],
        'headline-lg-mobile': ['32px', { lineHeight: '36px', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'ui-label': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '400' }],
        'ui-button': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      },
      spacing: {
        unit: '4px',
        gutter: '24px',
        'margin-edge': '64px',
        'asymmetric-offset': '12.5%',
        'section-gap': '160px',
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        full: '9999px', // Only for avatars/icons
      },
      boxShadow: {
        // No shadows in Modern Editorial - flat design
        'none': 'none',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(180deg, #fbf9f9 0%, #f5f3f3 100%)',
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
      },
    },
  },
  plugins: [],
};