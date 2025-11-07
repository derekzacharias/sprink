/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2fbf5',
          100: '#e0f7e7',
          200: '#bff0cf',
          300: '#8fe3ae',
          400: '#5acd86',
          500: '#37b96b',
          600: '#279356',
          700: '#207447',
          800: '#1d5d3b',
          900: '#174a31'
        }
      }
    }
  },
  plugins: []
}

