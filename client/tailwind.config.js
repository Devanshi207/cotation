// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
      },
      keyframes: {
        waveY: {
          "0%,100%": { backgroundPositionY: "0%"   },
          "50%"   : { backgroundPositionY: "100%" },
        },
      },
      animation: {
        waveY: "waveY 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
