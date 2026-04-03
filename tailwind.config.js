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
          DEFAULT: '#E1242A',
          dark: '#891515',
        },
        accent: {
          DEFAULT: '#BD120A',
          light: '#F78C85',
          dark: '#450A0A',
        },
        secondary: {
          DEFAULT: '#34373f',
          light: '#A1A4AC',
          lighter: '#EDF2F4',
        },
      },
    },
  },
  plugins: [],
}
