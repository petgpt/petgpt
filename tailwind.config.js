/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark"],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("daisyui"),
    require('prettier-plugin-tailwindcss'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
