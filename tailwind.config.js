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
        brand: {
          50: '#f4f6fe',
          100: '#eaedfcf',
          200: '#d9e0fc',
          300: '#bdcbfa',
          400: '#97aff6',
          500: '#6385f1', // Vibrant developer theme accent
          600: '#4863e7',
          700: '#3a4fd4',
          800: '#3442ac',
          900: '#2e3989',
          950: '#202552',
        },
        slate: {
          850: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}
