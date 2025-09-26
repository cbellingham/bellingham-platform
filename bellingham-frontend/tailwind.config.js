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
        primary: '#00D1FF',
        secondary: '#FF4D9B',
        accent: '#FF4D9B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
