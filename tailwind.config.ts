import type { Config } from "tailwindcss";

/**
 * Colour tokens resolve through CSS variables so that:
 *   - `/opacity` modifiers keep working everywhere (`bg-teal-900/10`), and
 *   - the marketing tree can flip to a dark palette by overriding variables on
 *     `.theme-site` alone, without touching the admin panel.
 *
 * The `teal` / `cream` / `ink` / `line` ramp holds exactly the same values it
 * held before; only its expression changed.
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: withAlpha("--c-teal-50"),
          100: withAlpha("--c-teal-100"),
          200: withAlpha("--c-teal-200"),
          300: withAlpha("--c-teal-300"),
          400: withAlpha("--c-teal-400"),
          500: withAlpha("--c-teal-500"),
          600: withAlpha("--c-teal-600"),
          700: withAlpha("--c-teal-700"),
          800: withAlpha("--c-teal-800"),
          900: withAlpha("--c-teal-900"),
        },
        cream: {
          DEFAULT: withAlpha("--c-cream"),
          card: withAlpha("--c-cream-card"),
        },
        ink: {
          DEFAULT: withAlpha("--c-ink"),
          muted: withAlpha("--c-ink-muted"),
        },
        line: withAlpha("--c-line"),
        positive: withAlpha("--c-positive"),
        negative: withAlpha("--c-negative"),

        // Marketing surface tokens (scheme-aware inside `.theme-site`).
        paper: {
          DEFAULT: withAlpha("--paper"),
          sub: withAlpha("--paper-sub"),
        },
        surface: {
          DEFAULT: withAlpha("--surface"),
          2: withAlpha("--surface-2"),
        },
        fg: {
          DEFAULT: withAlpha("--fg"),
          muted: withAlpha("--fg-muted"),
        },
        heading: withAlpha("--heading"),
        edge: {
          DEFAULT: withAlpha("--edge"),
          2: withAlpha("--edge-2"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          strong: withAlpha("--accent-strong"),
          sub: withAlpha("--accent-sub"),
        },

        // Deep-green bands. Identical in both colour schemes.
        canvas: {
          DEFAULT: withAlpha("--canvas"),
          2: withAlpha("--canvas-2"),
          3: withAlpha("--canvas-3"),
          fg: withAlpha("--canvas-fg"),
          "fg-muted": withAlpha("--canvas-fg-muted"),
          edge: withAlpha("--canvas-edge"),
        },
        mint: {
          DEFAULT: withAlpha("--mint"),
          2: withAlpha("--mint-2"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        // The admin panel styles its headings with `font-serif` and keeps Lora.
        // The marketing site no longer uses this token at all; it uses
        // `font-display`. Lora is loaded with `preload: false`, so marketing
        // pages never fetch it.
        serif: ["var(--font-lora)", "Lora", "Georgia", "serif"],
      },
      maxWidth: {
        content: "1240px",
      },
      borderRadius: {
        card: "14px",
        button: "12px",
        panel: "20px",
        device: "44px",
      },
      letterSpacing: {
        tightish: "-0.015em",
        display: "-0.032em",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 40 33 / 0.04), 0 8px 24px -12px rgb(0 40 33 / 0.10)",
        lift: "0 2px 4px rgb(0 40 33 / 0.05), 0 18px 40px -20px rgb(0 40 33 / 0.20)",
        float: "0 4px 8px rgb(0 40 33 / 0.06), 0 40px 80px -32px rgb(0 40 33 / 0.34)",
        device: "0 60px 120px -40px rgb(0 20 16 / 0.65), 0 8px 24px -8px rgb(0 20 16 / 0.4)",
        mint: "0 12px 32px -12px rgb(2 169 136 / 0.55)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
