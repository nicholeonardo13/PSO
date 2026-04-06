/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange:  '#F76C45',
          'orange-hover': '#E55A32',
          'orange-light': '#FFF4F0',
          black:   '#110B0A',
          'card':  '#1A100D',
          'surface': '#231410',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
