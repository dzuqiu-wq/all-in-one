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
        // Theme Colors (Light/Dark adaptive)
        // These tokens work with Tailwind dark: prefix and CSS custom properties
        theme: {
          bg: {
            primary: "var(--bg-primary, #faf9f5)",
            secondary: "var(--bg-secondary, #f5f0e8)",
            tertiary: "var(--bg-tertiary, #efe9de)",
            inverse: "var(--bg-inverse, #181715)",
          },
          text: {
            primary: "var(--text-primary, #141413)",
            secondary: "var(--text-secondary, #3d3d3a)",
            tertiary: "var(--text-tertiary, #6c6a64)",
            inverse: "var(--text-inverse, #faf9f5)",
            muted: "var(--text-muted, #8e8b82)",
          },
          border: {
            primary: "var(--border-primary, #e6dfd8)",
            secondary: "var(--border-secondary, #ebe6df)",
          },
          accent: {
            primary: "var(--accent-primary, #cc785c)",
            hover: "var(--accent-hover, #a9583e)",
            soft: "var(--accent-soft, rgba(204, 120, 92, 0.15))",
          },
          surface: {
            elevated: "var(--surface-elevated, #ffffff)",
            overlay: "var(--surface-overlay, rgba(20, 20, 19, 0.5))",
          },
        },
        // Claude Brand Colors
        primary: {
          DEFAULT: "#cc785c",
          active: "#a9583e",
          disabled: "#e6dfd8",
        },
        accent: {
          teal: "#5db8a6",
          amber: "#e8a55a",
        },
        // Text Colors
        ink: "#141413",
        body: "#3d3d3a",
        "body-strong": "#252523",
        muted: "#6c6a64",
        "muted-soft": "#8e8b82",
        // Surface Colors
        canvas: "#faf9f5",
        "surface-soft": "#f5f0e8",
        "surface-card": "#efe9de",
        "surface-cream-strong": "#e8e0d2",
        "surface-dark": "#181715",
        "surface-dark-elevated": "#252320",
        "surface-dark-soft": "#1f1e1b",
        // Borders
        hairline: "#e6dfd8",
        "hairline-soft": "#ebe6df",
        // On Surfaces
        "on-primary": "#ffffff",
        "on-dark": "#faf9f5",
        "on-dark-soft": "#a09d96",
        // Semantic
        success: "#5db872",
        warning: "#d4a017",
        error: "#c64545",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Tiempos Headline", "Garamond", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.05", letterSpacing: "-1.5px", fontWeight: "400" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-1px", fontWeight: "400" }],
        "display-md": ["36px", { lineHeight: "1.15", letterSpacing: "-0.5px", fontWeight: "400" }],
        "display-sm": ["28px", { lineHeight: "1.2", letterSpacing: "-0.3px", fontWeight: "400" }],
        "title-lg": ["22px", { lineHeight: "1.3", fontWeight: "500" }],
        "title-md": ["18px", { lineHeight: "1.4", fontWeight: "500" }],
        "title-sm": ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.4", fontWeight: "500" }],
        "caption-upper": ["12px", { lineHeight: "1.4", letterSpacing: "1.5px", fontWeight: "500" }],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;