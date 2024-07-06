module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark"]
  }
}