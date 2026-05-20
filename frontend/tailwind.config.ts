import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cyberpunk Color System - using CSS variables for runtime theming
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--neon-green)",
          foreground: "var(--bg-primary)",
        },
        secondary: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--neon-blue)",
          foreground: "var(--bg-primary)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--text-primary)",
        },
        border: "var(--border-default)",
        input: "var(--border-default)",
        ring: "var(--neon-green)",
        // Direct color utilities
        "neon-green": "#00FF66",
        "neon-blue": "#00E5FF",
        "bg-primary": "#08090C",
        "bg-secondary": "#0D1117",
        "bg-card": "#111318",
        "bg-elevated": "#161B22",
        "border-default": "#21262D",
        "border-hover": "#30363D",
        "text-primary": "#E2E8F0",
        "text-secondary": "#8B949E",
        "text-muted": "#484F58",
        "success": "#00FF66",
        "warning": "#FFB800",
        "error": "#FF4757",
        "info": "#00E5FF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-roboto-mono)",
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "breathing-glow": "breathingGlow 3s ease-in-out infinite",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        breathingGlow: {
          "0%, 100%": {
            boxShadow: "0 0 4px var(--neon-green)",
            opacity: "0.8",
          },
          "50%": {
            boxShadow: "0 0 12px var(--neon-green), 0 0 24px rgba(0, 255, 102, 0.3)",
            opacity: "1",
          },
        },
        pulseGreen: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 4px var(--neon-green)",
          },
          "50%": {
            opacity: "0.6",
            boxShadow: "0 0 8px var(--neon-green), 0 0 16px rgba(0, 255, 102, 0.3)",
          },
        },
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(0, 255, 102, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 102, 0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid": "20px 20px",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};

export default config;