/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Satoshi', 'sans-serif'],
      satoshi: ['Satoshi', 'sans-serif'],
    },
    extend: {
      fontSize: {
        'medium': '500',
      },
    },
  },
  plugins: [],
};
