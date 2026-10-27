/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kmc: {
          navy: '#0B2A5B',
          'navy-dark': '#061938',
          'navy-light': '#163B75',
          green: '#2E7D32',
          'green-light': '#4CAF50',
          'green-accent': '#7CB342',
          purple: '#5B2A9E',
          'purple-light': '#7E57C2',
          orange: '#F57C00',
          'orange-light': '#FF9800',
          teal: '#00897B',
          'teal-light': '#26A69A',
          red: '#D32F2F',
          'red-light': '#EF5350',
          bg: '#F4F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        heading: ['Oswald', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 14px 0 rgba(11, 42, 91, 0.07)',
        'card-hover': '0 8px 25px 0 rgba(11, 42, 91, 0.12)',
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
