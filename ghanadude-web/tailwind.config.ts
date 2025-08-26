import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b3d7ff',
          300: '#8cc2ff',
          400: '#66aeff',
          500: '#4099ff',
          600: '#1a85ff',
          700: '#006fe6',
          800: '#0058b4',
          900: '#004182'
        }
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0,0,0,0.15)'
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
