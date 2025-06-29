/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./layout/*.liquid",
    "./templates/*.liquid",
    "./sections/*.liquid",
    "./snippets/*.liquid",
  ],
  theme: {
    extend: {
      colors: {
        'deep-moss-black': '#1B2727',
        'forest-shadow': '#3C5148',
        'olive-verde': '#688E4E',
        'herbal-cream': '#B2C582',
        'mist-gray': '#D5DDDF',
      },
    },
  },
  plugins: [],
}
