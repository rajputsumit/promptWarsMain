import type { Config } from "tailwindcss";

/**
 * "Zen Orange" design system — ported verbatim from the Google Stitch
 * "Serene Scholar Wellness" project so the app matches the source designs 1:1.
 * Atmospheric Serenity: warm terracotta, soft peach, sage mist, glassmorphism.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#ebe8e3",
        "secondary-fixed": "#fbdebe",
        "on-surface": "#1c1c19",
        surface: "#fcf9f4",
        "primary-fixed": "#ffdbcd",
        "on-error": "#ffffff",
        "surface-dim": "#dcdad5",
        "inverse-surface": "#31302d",
        "inverse-on-surface": "#f3f0eb",
        background: "#fcf9f4",
        "tertiary-fixed": "#dce5d4",
        "surface-variant": "#e5e2dd",
        "secondary-container": "#fbdebe",
        "surface-container": "#f0ede9",
        "on-secondary-container": "#766148",
        "surface-bright": "#fcf9f4",
        "on-primary": "#ffffff",
        "surface-container-highest": "#e5e2dd",
        "surface-container-lowest": "#ffffff",
        "primary-fixed-dim": "#ffb597",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#f6f3ee",
        "tertiary-container": "#a1aa9a",
        "on-error-container": "#93000a",
        "on-tertiary-fixed-variant": "#41493c",
        tertiary: "#586153",
        "primary-container": "#e8926d",
        error: "#ba1a1a",
        "outline-variant": "#d9c2b9",
        "on-background": "#1c1c19",
        outline: "#86736b",
        "on-primary-fixed-variant": "#733517",
        "on-tertiary-container": "#373f33",
        "error-container": "#ffdad6",
        "inverse-primary": "#ffb597",
        primary: "#914b2c",
        "secondary-fixed-dim": "#dec2a4",
        "on-secondary": "#ffffff",
        secondary: "#705b42",
        "on-primary-fixed": "#360f00",
        "tertiary-fixed-dim": "#c0c9b9",
        "on-surface-variant": "#54433d",
        "on-secondary-fixed-variant": "#57432c",
        "on-primary-container": "#662b0e",
        "surface-tint": "#914b2c",
        "on-secondary-fixed": "#271906",
        "on-tertiary-fixed": "#161e13",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        "section-gap": "48px",
        "container-padding": "24px",
        base: "8px",
        gutter: "16px",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        "headline-lg-mobile": ["var(--font-outfit)", "Outfit"],
        "body-md": ["var(--font-outfit)", "Outfit"],
        "body-lg": ["var(--font-outfit)", "Outfit"],
        "headline-lg": ["var(--font-outfit)", "Outfit"],
        "headline-md": ["var(--font-outfit)", "Outfit"],
        "label-md": ["var(--font-outfit)", "Outfit"],
      },
      fontSize: {
        "headline-lg-mobile": ["32px", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "headline-lg": ["40px", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "500" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        subtleBreathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "0.7" },
        },
        breathePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.18)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "subtle-breathe": "subtleBreathe 15s ease-in-out infinite",
        "breathe-pulse": "breathePulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
