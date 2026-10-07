import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shield: {
          bg: "#05070d",
          panel: "#0b0f1a",
          neon: "#39ff88",
          cyan: "#22d3ee",
        },
      },
    },
  },
  plugins: [],
};

export default config;
