/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a2ff',
          500: '#2b7fff',
          600: '#135bec',
          700: '#0c45bc',
          800: '#0f3a97',
          900: '#123377',
          950: '#0b1f4b',
        },
        tcr: {
          blue: '#1e40af',
          navy: '#0f172a',
          cement: '#64748b',
          gold: '#d97706',
          emerald: '#059669',
          crimson: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px -5px rgba(43, 127, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
