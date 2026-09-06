import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      colors: {
        // Semantic CSS variable bridge
        background: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          hover: "var(--surface-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        foreground: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        "fg-faint": "var(--fg-faint)",
        "muted-foreground": "var(--fg-muted)",
        "text-muted": "var(--fg-faint)",

        // Brand / accent (theme-aware)
        brand: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
          subtle: "var(--accent-subtle)",
          border: "var(--accent-border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-fg)",
        },
        primary: "var(--accent)",
        "primary-foreground": "var(--accent-fg)",
        secondary: "var(--surface-raised)",
        "secondary-foreground": "var(--fg-muted)",
        muted: "var(--surface-raised)",
        "accent-foreground": "var(--accent-fg)",

        // Semantic
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",

        // Card
        card: "var(--surface)",
        "card-foreground": "var(--fg)",
        input: "var(--surface)",

        // Legacy forge aliases (keep for backward compat with any hardcoded classes)
        forge: {
          50:  "#f0fdf0",
          100: "#dcf8dc",
          200: "#b8f0b8",
          300: "#86e086",
          400: "#4ece52",
          500: "#2C5F2A",
          600: "#235021",
          700: "#1a3f18",
          800: "#123010",
          900: "#0a1f09",
          950: "#050f04",
        },

        // Streak / heatmap
        streak: {
          cold:   "var(--border)",
          warm:   "var(--accent)",
          hot:    "var(--warning)",
          fire:   "var(--danger)",
        },
        heat: {
          0:   "var(--surface-raised)",
          25:  "var(--border)",
          50:  "var(--accent-subtle)",
          75:  "var(--accent)",
          100: "var(--accent)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in":  "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        card:         "var(--card-shadow)",
        "card-hover": "var(--card-shadow-hover)",
        subtle:       "0 1px 2px rgba(0,0,0,0.06)",
        accent:       "0 0 20px -4px var(--accent-subtle)",
      },
      borderRadius: {
        "os-sm": "8px",
        "os-md": "12px",
        "os-lg": "16px",
        "os-xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
