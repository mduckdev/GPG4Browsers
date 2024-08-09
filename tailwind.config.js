/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
  content: ["./src/**/*.{html,js,tsx}"],
  darkMode:['selector','[data-theme="dark"]'],
  
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark"]
  }
}