// filepath: c:\Users\HARBI Amine\Documents\Nexus-Help-Desk-N1-master\tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}", // ✅ CORRECTION: Couvre tous vos fichiers
    "!./node_modules/**",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}