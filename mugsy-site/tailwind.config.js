/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neonRed: "#ff1a4b",
        neonBlue: "#00F0FF",
      },
    },
  },
  plugins: [],
}
