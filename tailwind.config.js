/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],
  daisyui: {
    themes: ["light", "dark"]
  }
}

