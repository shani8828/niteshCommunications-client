/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#ffffff',     /* Light main background */
          deep: '#f8fafc',     /* Soft light gray section background */
          slate: '#f1f5f9',    /* Light border/card background */
          cyan: '#1e40af',     /* Brand blue accent */
          blue: '#2563eb',     /* Brand royal blue primary */
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
