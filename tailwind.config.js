/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Kommunitea — SlothUI-style: indigo/violet accent on clean cool-white
        ink: {
          DEFAULT: "#1E1E2D", // near-black slate — headings & primary text
          soft: "#3F3F52",
          muted: "#8A8FA3",
        },
        // "coral" token now maps to SlothUI indigo/violet (kept the name so all
        // existing classes recolor automatically)
        coral: {
          DEFAULT: "#5B5FEF", // primary accent — buttons, links, active
          soft: "#7C80F5",
          dark: "#4A4DD6",
        },
        sky: {
          DEFAULT: "#5B5FEF",
          soft: "#EEF0FF", // light indigo tint for chips/cards
        },
        // "sand" token now maps to the cool white/grey surfaces
        sand: {
          DEFAULT: "#F6F7FB", // page background
          card: "#FFFFFF",
          border: "#ECEDF3",
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
