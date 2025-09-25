export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        base: '#0d1b2a',
        surface: '#1b263b',
        contrast: '#e0e6ed',
        primary: '#1d4ed8',
        secondary: '#3b82f6',
        accent: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
