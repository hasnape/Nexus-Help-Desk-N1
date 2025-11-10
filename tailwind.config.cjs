/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#475569',
          light: '#64748B',
          dark: '#334155',
        },
        accent: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        background: '#F1F5F9',
        surface: '#FFFFFF',
        textPrimary: '#1E293B',
        textSecondary: '#475569',
      },
    },
  },
  plugins: [],
};
