import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base themes
        "brand-light": "#faf8ff",
        "brand-dark": "#0a071b",

        // Logo-derived palette
        "brand-primary": "#8c52ff",       // violet purple
        "brand-accent": "#ff6ec7",        // hot magenta
        "brand-secondary": "#00e0ff",     // cyan electric
        "brand-pink": "#ff9de2",          // baby pink
        "brand-blue": "#6ecbff",          // pastel sky blue
        "brand-yellow": "#ffd166",        // soft gold
        "brand-orange": "#ff9671",        // peach/apricot
        "brand-muted": "#b4b4c6",         // lavender gray

        // Neon/tech-mode dark accents
        "neon-purple": "#c084fc",
        "neon-magenta": "#f472b6",
        "neon-cyan": "#67e8f9",
        "neon-orange": "#fb923c",

        // Background overlays
        "overlay-light": "rgba(255,255,255,0.6)",
        "overlay-dark": "rgba(0,0,0,0.7)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        neon: "0 0 10px rgba(255, 110, 199, 0.9), 0 0 20px rgba(140, 82, 255, 0.7)",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #ff6ec7" },
          "100%": { boxShadow: "0 0 20px #8c52ff" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
