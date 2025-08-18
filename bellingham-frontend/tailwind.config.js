export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        base: '#111827',
        contrast: '#fff',
        surface: {
          DEFAULT: '#1f2937',
          secondary: '#374151',
          tertiary: '#4b5563'
        },
        border: '#374151',
        primary: {
          light: '#3b82f6',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8'
        },
        success: {
          DEFAULT: '#16a34a',
          dark: '#15803d'
        },
        danger: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c'
        },
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
