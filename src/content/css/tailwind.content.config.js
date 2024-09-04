/** @type {import('tailwindcss').Config} */
module.exports = {
    // content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
    content: ["./src/**/*.{html,js,tsx}"],
    prefix: 'tw-',
    theme: {
      extend: {},
    },
    corePlugins: {
      preflight: false,
    },
    plugins: [require('daisyui')],
    // daisyui: {
    //   themes: ["light", "dark"]
    // }
  }