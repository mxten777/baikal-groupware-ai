/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        baikal: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd4ff',
          300: '#8ebaff',
          400: '#5994ff',
          500: '#3370ff',
          600: '#1b4ff5',
          700: '#143ce1',
          800: '#1731b6',
          900: '#192f8f',
          950: '#111d57',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f7f8fa',
          tertiary: '#f0f2f5',
          hover: '#e8eaef',
          border: '#e3e5ea',
        },
        dark: {
          DEFAULT: '#0c111d',
          secondary: '#161b26',
          tertiary: '#1f242f',
          hover: '#333946',
          border: '#2b3040',
        },
        accent: {
          purple: '#7c3aed',
          teal: '#0d9488',
          rose: '#e11d48',
          amber: '#d97706',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'glass': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02), 0 12px 24px rgba(0,0,0,0.03)',
        'glass-lg': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06)',
        'premium': '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
        'premium-lg': '0 4px 12px rgba(0,0,0,0.05), 0 20px 48px rgba(0,0,0,0.1)',
        'glow-blue': '0 0 20px rgba(51,112,255,0.15), 0 0 60px rgba(51,112,255,0.08)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.15), 0 0 60px rgba(124,58,237,0.08)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in': 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
