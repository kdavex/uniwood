/** @type {import('tailwindcss').Config} */

module.exports = {
  important: true,
  output: "./client/tailwind.css",
  content: [
    "./index.html",
    "./client/routes/**/*.tsx",
    "./client/components/**/*.tsx",
    "./client/*.{tsx,html}",
    "./client/providers/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF5F3",
          100: "#FDE7E3",
          200: "#fcd4cc",
          300: "#f8b6a9",
          400: "#f17f69",
          500: "#e8644b",
          600: "#d4492e",
          700: "#b23a23",
          800: "#943320",
          900: "#7b3021",
          950: "#43150c",
        },
        secondary: {
          50: "#F2F9F9",
          100: "#DDEDF0",
          200: "#BFDCE2",
          300: "#93C2CD",
          400: "#73ACBA",
          500: "#448596",
          600: "#3B6E7F",
          700: "#355B69",
          800: "#324D58",
          900: "#2d414c",
          950: "#1a2932",
        },
        tertiary: "#F1EFEE",
        fourth: "#BA4A4A",
        prima: "#EF6D53",
      },
      fontFamily: {
        default: ["Poppins", "sans-serif", "system-ui"],
        header: ["Poppins", "sans-serif", "system-ui"],
        body: ["Roberto", "sans-serif", "system-ui"],
        body2: ["Poppins", "sans-serif", "system-ui"],
        sans: [
          "Poppins",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
        poppins: ["Poppins", "sans-serif"],
      },
      screens: {
        sm: "300px",
        custom: "450.5px",
        custom2: "450px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
