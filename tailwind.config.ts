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
          50: "#F3FBF7",
          100: "#E1F5EE",
          200: "#9FE1CB",
          300: "#5DCAA5",
          400: "#1D9E75",
          500: "#0F8C66",
          600: "#0A7C7C",
          700: "#0A5E48",
          800: "#085041",
          900: "#04342C",
        },
        cream: {
          DEFAULT: "#FAF5EC",
          card: "#FFFDF7",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6B6B",
        },
        line: "#E5E0D5",
        positive: "#1A7B5C",
        negative: "#B94A3C",
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
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
};
export default config;
