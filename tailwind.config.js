/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4ADE80",
        secondary: "#2DD4BF",
        background: "#000000",
        surface: "#1A1A1A",
        surfaceLight: "#2A2A2A",
        white: "#FFFFFF",
        grey: "#9CA3AF",
      },
      fontFamily: {
        "jetbrains-mono": ["JetBrainsMono-Medium"],
      },
    },
  },
  plugins: [],
};
