/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brain: {
          50: "#f2f7ff",
          100: "#dfeaff",
          400: "#5f9dff",
          500: "#3b7dff",
          600: "#2a63e0",
        },
        focus: {
          400: "#7fd8a3",
          500: "#4fbf82",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
