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

        // Marketing surface tokens, scoped to `.theme-site`.
        canvas: {
          DEFAULT: withAlpha("--canvas"),
          2: withAlpha("--canvas-2"),
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
          deep: withAlpha("--accent-deep"),
          sub: withAlpha("--accent-sub"),
          glow: withAlpha("--accent-glow"),
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
        tightish: "-0.02em",
        display: "-0.038em",
      },
      // Depth on a near-black ground. One light, above and slightly behind the
      // viewer, so every shadow on the page falls in the same direction and
      // raised surfaces all carry the same one-pixel top highlight. A shadow
      // that disagrees with the others is the fastest way to make a dark page
      // read as assembled rather than lit.
      boxShadow: {
        soft: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 1px 2px rgb(0 0 0 / 0.55), 0 20px 44px -26px rgb(0 0 0 / 0.85)",
        lift: "inset 0 1px 0 rgb(255 255 255 / 0.09), 0 2px 8px rgb(0 0 0 / 0.55), 0 34px 64px -26px rgb(0 0 0 / 0.9)",
        float: "0 10px 24px -6px rgb(0 0 0 / 0.6), 0 56px 104px -34px rgb(0 0 0 / 0.92)",
        device:
          "0 2px 8px rgb(0 0 0 / 0.65), 0 24px 48px -16px rgb(0 0 0 / 0.7), 0 80px 140px -40px rgb(0 0 0 / 0.95)",
        mint: "0 10px 30px -10px rgb(95 227 168 / 0.55)",
        // A pressed control: the highlight moves to the bottom edge.
        inset: "inset 0 2px 6px rgb(0 0 0 / 0.5), inset 0 -1px 0 rgb(255 255 255 / 0.06)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
