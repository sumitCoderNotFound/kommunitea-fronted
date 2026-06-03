/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens map to CSS variables so the whole app re-themes (light/dark)
        // by toggling the `.dark` class on <html>.
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        coral: {
          DEFAULT: "rgb(var(--coral) / <alpha-value>)",
          soft: "rgb(var(--coral-soft) / <alpha-value>)",
          dark: "rgb(var(--coral-dark) / <alpha-value>)",
        },
        sky: {
          DEFAULT: "rgb(var(--coral) / <alpha-value>)",
          soft: "rgb(var(--sky-soft) / <alpha-value>)",
        },
        sand: {
          DEFAULT: "rgb(var(--sand) / <alpha-value>)",
          card: "rgb(var(--sand-card) / <alpha-value>)",
          border: "rgb(var(--sand-border) / <alpha-value>)",
        },
        success: "#16A34A",
        warn: "#F59E0B",
      },
      fontFamily: {
        display: ['"Clash Display"', "ui-sans-serif", "system-ui"],
        sans: ['"Satoshi"', "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(30, 30, 60, 0.05)",
        card: "0 4px 20px rgba(30, 30, 60, 0.06)",
        lift: "0 12px 32px rgba(30, 30, 60, 0.10)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
