import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        ink: "#0a0a0f",
        surface: "#111118",
        card: "#16161f",
        border: "#1e1e2e",
        accent: "#7c6af7",
        "accent-dim": "#3d3680",
        muted: "#4a4a6a",
        text: "#e2e2f0",
        "text-dim": "#8888aa",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease forwards",
        "bar-fill": "bar-fill 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse2": "pulse2 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
