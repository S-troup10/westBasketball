/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./admin/*.html", "./common.js", "./data.js", "./admin/*.js"],
  theme: {
    extend: {
      fontFamily: { sans: ["Outfit", "ui-sans-serif", "system-ui"] },
      colors: {
        primary: "#10b981",
        accent: "#06d6a0",
        danger: "#ef4444",
        dark: "#0a0a0a",
        darker: "#050505",
        light: "#f8fafc"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,.55)",
        glow: "0 0 60px rgba(16,185,129,.22)"
      }
    }
  },
  plugins: []
};
