/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './popup.html',
    './dashboard.html',
    './src/popup/**/*.{js,ts,jsx,tsx}',
    './src/dashboard/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
