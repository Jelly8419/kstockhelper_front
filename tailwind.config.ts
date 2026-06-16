import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface palette (dark-first financial look)
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        muted: "var(--muted)",
        // Brand
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
        },
        // Market direction (Korean market convention: red=up, blue=down)
        up: "var(--up)",
        down: "var(--down)",
        // Price-gap table: green = positive/gain
        gain: "var(--gain)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      maxWidth: {
        container: "1120px",
      },
    },
  },
  plugins: [],
};
export default config;
