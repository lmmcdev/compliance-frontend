/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7FF',
          200: '#BAE7FF',
          500: '#00A1FF',
          600: '#0080CC',
        },
        // Status colors matching maintenance-frontend
        status: {
          new: {
            bg: '#FFE2EA',
            text: '#FF6692'
          },
          emergency: {
            bg: '#FFF5DA',
            text: '#FFB900'
          },
          progress: {
            bg: '#DFF3FF',
            text: '#00A1FF'
          },
          pending: {
            bg: '#EAE8FA',
            text: '#8965E5'
          },
          done: {
            bg: '#DAF8F4',
            text: '#00B8A3'
          },
          duplicated: {
            bg: '#FFE3C4',
            text: '#FF8A00'
          }
        },
        // Priority colors
        priority: {
          high: '#f46a6a',
          medium: '#ffb900',
          low: '#00b8a3'
        },
        // Extended color variants
        pink: {
          50: '#FFE2EA',
          200: '#FF6692',
          500: '#FF1744'
        },
        yellow: {
          50: '#FFF5DA',
          200: '#FFB900',
          500: '#FF8F00'
        },
        blue: {
          50: '#DFF3FF',
          200: '#00A1FF',
          500: '#0080CC'
        },
        purple: {
          50: '#EAE8FA',
          200: '#8965E5',
          500: '#6200EA'
        },
        teal: {
          50: '#DAF8F4',
          200: '#00B8A3',
          500: '#00695C'
        },
        orange: {
          50: '#FFE3C4',
          200: '#FF8A00',
          500: '#E65100'
        }
      },
      screens: {
        'xs': '475px',
      },
      fontSize: {
        'xs': ['14px', '20px'],
        'sm': ['16px', '24px'],
        'base': ['18px', '28px'],
        'lg': ['20px', '28px'],
        'xl': ['24px', '32px'],
        '2xl': ['30px', '36px'],
        '3xl': ['36px', '40px'],
        '4xl': ['48px', '56px'],
        '5xl': ['60px', '72px'],
        '6xl': ['72px', '80px'],
        '7xl': ['96px', '104px'],
        '8xl': ['128px', '136px'],
        '9xl': ['128px', '136px'],
      }
    },
  },
  plugins: [],
}