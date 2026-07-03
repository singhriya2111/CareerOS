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
        'tea-green': { DEFAULT: '#ccd5ae', 100: '#2d331a', 200: '#5b6635', 300: '#88994f', 400: '#acbb7b', 500: '#ccd5ae', 600: '#d6debe', 700: '#e1e6cf', 800: '#ebeedf', 900: '#f5f7ef' },
        'beige': { DEFAULT: '#e9edc9', 100: '#3d4216', 200: '#79842c', 300: '#b3c146', 400: '#ced788', 500: '#e9edc9', 600: '#edf1d4', 700: '#f2f4df', 800: '#f6f8ea', 900: '#fbfbf4' },
        'cornsilk': { DEFAULT: '#fefae0', 100: '#5d5103', 200: '#baa206', 300: '#f8dc27', 400: '#fbeb84', 500: '#fefae0', 600: '#fefbe7', 700: '#fefced', 800: '#fffdf3', 900: '#fffef9' },
        'papaya-whip': { DEFAULT: '#faedcd', 100: '#533e08', 200: '#a57b10', 300: '#eab227', 400: '#f2d079', 500: '#faedcd', 600: '#fbf1d6', 700: '#fcf4e0', 800: '#fdf8eb', 900: '#fefbf5' },
        'light-bronze': { DEFAULT: '#d4a373', 100: '#32210f', 200: '#64411f', 300: '#96622e', 400: '#c58341', 500: '#d4a373', 600: '#dcb68f', 700: '#e5c8ab', 800: '#eedac7', 900: '#f6ede3' },
        'sky-blue': { DEFAULT: '#8ecae6', 100: '#0d2e3d', 200: '#1b5c7a', 300: '#288ab7', 400: '#51aed9', 500: '#8ecae6', 600: '#a5d5eb', 700: '#bbdff0', 800: '#d2eaf5', 900: '#e8f4fa' },
        'blue-green': { DEFAULT: '#219ebc', 100: '#071f25', 200: '#0d3e4b', 300: '#145d70', 400: '#1a7d95', 500: '#219ebc', 600: '#39bcdc', 700: '#6bcce5', 800: '#9cddee', 900: '#ceeef6' },
        'deep-space-blue': { DEFAULT: '#023047', 100: '#00090e', 200: '#01131c', 300: '#011c2a', 400: '#012638', 500: '#023047', 600: '#04699b', 700: '#06a3f1', 800: '#54c3fb', 900: '#a9e1fd' },
        'amber-flame': { DEFAULT: '#ffb703', 100: '#342500', 200: '#684b00', 300: '#9c7000', 400: '#d09500', 500: '#ffb703', 600: '#ffc637', 700: '#ffd569', 800: '#ffe39b', 900: '#fff1cd' },
        'princeton-orange': { DEFAULT: '#fb8500', 100: '#321b00', 200: '#643500', 300: '#965000', 400: '#c86b00', 500: '#fb8500', 600: '#ff9e2f', 700: '#ffb663', 800: '#ffce97', 900: '#ffe7cb' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
