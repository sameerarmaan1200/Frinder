/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        dark: {
          50:  '#1a2332',
          100: '#141c2b',
          200: '#0f1624',
          300: '#0d1526',
          400: '#0a1020',
          500: '#070c18',
          600: '#050910',
          700: '#030608',
        },
        accent: '#3b9eff',
        glow:   '#0066ff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'spin-slow':    'spin 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #0066ff40' },
          '100%': { boxShadow: '0 0 20px #0066ff80, 0 0 40px #0066ff40' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(0,102,255,0.3)',
        'glow-md':  '0 0 20px rgba(0,102,255,0.4)',
        'glow-lg':  '0 0 40px rgba(0,102,255,0.5)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,102,255,0.2)',
      },
    },
  },
  plugins: [],
}
