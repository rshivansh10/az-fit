/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        card: '#1f2937',
        accent: '#22c55e'
      }
    }
  },
  plugins: []
}
