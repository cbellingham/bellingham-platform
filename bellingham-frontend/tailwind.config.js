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
        secondary: '#3BAEAB',
        accent: '#7465A8',
        highlight: {
          teal: '#3BAEAB',
          purple: '#7465A8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
