import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f1419",
          alt: "#1a1f2e",
        },
        accent: {
          DEFAULT: "#8A2BE2",
          strong: "#9932CC",
        },
        lavender: "#E6E6FA",
        neutral: {
          50: "#F5F5F5",
          100: "#EDEDED",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "Manrope", "sans-serif"],
        accent: ["var(--font-manrope)", "Manrope", "Inter", "sans-serif"],
      },
      dropShadow: {
        glow: "0 0 25px rgba(138, 43, 226, 0.45)",
      },
      boxShadow: {
        card: "0 20px 45px rgba(15, 20, 25, 0.55)",
      },
      backgroundImage: {
        "grid-s":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;

