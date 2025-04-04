/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // ← this enables dark mode if the OS is in dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}
