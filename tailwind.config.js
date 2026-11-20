/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed', // Primary purple
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          blue: '#2563eb',
          cyan: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 8px 24px -4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(124, 58, 237, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        'dropdown': '0 10px 30px -5px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
