import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c4d4ff',
          300: '#9eb3ff',
          400: '#7b8dff',
          500: '#e05a36', // map core brand color to the orange
          600: '#c54627',
          700: '#a3351b',
          800: '#822813',
          900: '#621b0b',
          950: '#3f0c03',
          orange: '#e05a36',
          dark: '#2d2d2d',
          charcoal: '#111111',
          grayText: '#707070',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f3f3f3',
          tertiary: '#efefef',
          border: '#e5e5e5',
          'border-light': '#f0f0f0',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      boxShadow: {
        card: '0 0 0 1px rgba(99,102,241,0.1), 0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(99,102,241,0.3)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
