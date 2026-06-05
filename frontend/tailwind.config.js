/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: {
          DEFAULT: '#181818',
          dim: '#0e150e',
          bright: '#333b33',
          elevated: '#202020',
          container: '#1a211a',
          'container-high': '#242c24',
          'container-highest': '#2f372e',
          'container-low': '#161d16',
          'container-lowest': '#091009',
        },
        primary: {
          DEFAULT: '#1db954', // Spotify Green
          dim: '#53e076',
          container: '#004118',
        },
        secondary: {
          DEFAULT: '#4a90d9',
          dim: '#a0caff',
          container: '#0063a9',
        },
        tertiary: {
          DEFAULT: '#ff767b',
          dim: '#ffb3b3',
          container: '#730a1b',
        },
        accent: {
          red: '#e74c3c',
          gold: '#f39c12',
        },
        border: '#2a2a2a',
        'text-primary': '#ffffff',
        'text-muted': '#b3b3b3',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
