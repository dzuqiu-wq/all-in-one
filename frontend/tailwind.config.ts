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
        // Brand Primary (Emerald)
        primary: "#3ecf8e",
        "primary-deep": "#24b47e",
        "primary-soft": "#4ade80",
        // Text
        ink: "#171717",
        "ink-secondary": "#212121",
        "ink-mute": "#707070",
        "ink-mute-2": "#9a9a9a",
        // Surfaces
        canvas: "#ffffff",
        "canvas-soft": "#fafafa",
        "canvas-night": "#1c1c1c",
        "canvas-night-soft": "#202020",
        // Borders
        hairline: "#dfdfdf",
        "hairline-strong": "#c7c7c7",
        // On Surfaces
        "on-primary": "#171717",
        "on-dark": "#ffffff",
        // Semantic
        success: "#3ecf8e",
        warning: "#f5a623",
        error: "#ee0000",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-1.92px", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-1.44px", fontWeight: "500" }],
        "display-md": ["36px", { lineHeight: "1.15", letterSpacing: "-0.72px", fontWeight: "500" }],
        "display-sm": ["28px", { lineHeight: "1.2", letterSpacing: "-0.42px", fontWeight: "500" }],
        "title-lg": ["22px", { lineHeight: "1.2", fontWeight: "500" }],
        "title-md": ["18px", { lineHeight: "1.4", fontWeight: "500" }],
        "title-sm": ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.45", fontWeight: "400" }],
        "caption-upper": ["12px", { lineHeight: "1.4", letterSpacing: "0.4px", fontWeight: "500" }],
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        xxl: "32px",
        "3xl": "48px",
        "4xl": "64px",
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