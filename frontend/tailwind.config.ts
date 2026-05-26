import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Supabase design tokens — mapped to CSS custom properties
        canvas: {
          DEFAULT: "var(--canvas)",
          soft: "var(--canvas-soft)",
          night: "var(--canvas-night)",
          "night-soft": "var(--canvas-night-soft)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          mute: "var(--ink-mute)",
          "mute-2": "var(--ink-mute-2)",
          faint: "var(--ink-faint)",
          body: "var(--body)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          deep: "var(--primary-deep)",
          soft: "var(--primary-soft)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          strong: "var(--hairline-strong)",
          cool: "var(--hairline-cool)",
        },
        "on-primary": "var(--on-primary)",
        "on-dark": {
          DEFAULT: "var(--on-dark)",
          soft: "var(--on-dark-soft)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      spacing: {
        section: "80px",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
