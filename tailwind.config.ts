import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#EFFDF7",
          100: "#E6F7EF",
          200: "#CDEDE1",
          300: "#8ED9BF",
          400: "#2FB384",
          500: "#007E5A",
          600: "#006B56",
          700: "#005B4F",
          800: "#004D43",
          900: "#003C34",
        },
        cream: {
          DEFAULT: "#FAFBFA",
          card: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#102622",
          muted: "#68726F",
        },
        line: "#E6ECE9",
        positive: "#007E5A",
        negative: "#BA2A2A",
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Lora", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
          card: "14px",
          button: "12px",
      },
      letterSpacing: {
          tightish: "0",
      },
    },
  },
  plugins: [],
};
export default config;
