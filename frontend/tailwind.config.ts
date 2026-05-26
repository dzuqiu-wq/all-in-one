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
        // 柔和配色
        mint: {
          DEFAULT: '#7DD3C0',
          soft: '#B8E8DE',
          deep: '#5BBFA8',
        },
        lavender: {
          DEFAULT: '#E8D5F2',
          soft: '#F5EFF9',
        },
        cream: {
          DEFAULT: '#FDFBF7',
          deep: '#F5F0E8',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          soft: '#4A4A5A',
        },
        body: '#6B6B7B',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      spacing: {
        'section': '80px',
      },
      backdropBlur: {
        'xs': '4px',
      },
    },
  },
  plugins: [],
};

export default config;