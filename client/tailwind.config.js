/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f172a',
          blue: '#0284c7',
          gold: '#d97706',
          green: '#15803d',
          red: '#dc2626',
          yellow: '#ca8a04',
          slate: '#334155'
        }
      }
    },
  },
  plugins: [],
}
