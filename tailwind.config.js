/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        'soft-pink': {
          50: '#FFF5F5',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
        },
        'cream-yellow': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
        },
        'mint-green': {
          50: '#F0FDF4',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
        },
        'lavender': {
          50: '#FAF5FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
        },
        'sky-blue': {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
        },
        'warm-gray': {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#E7E0D5',
          300: '#D4C8B8',
          400: '#A8A29E',
          500: '#8B8178',
          600: '#6B645D',
          700: '#57534E',
          800: '#44403C',
          900: '#292524',
        },
      },
      fontFamily: {
        'serif-sc': ['"Noto Serif SC"', 'serif'],
        'sans-sc': ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'softer': '0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'glow-pink': '0 0 20px rgba(253, 164, 175, 0.4)',
        'glow-yellow': '0 0 20px rgba(253, 211, 77, 0.4)',
        'glow-green': '0 0 20px rgba(110, 231, 183, 0.4)',
        'glow-purple': '0 0 20px rgba(192, 132, 252, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
