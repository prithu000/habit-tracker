import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cal)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // FORGE Brand
        forge: {
          50:  "#f0f0ff",
          100: "#e4e4ff",
          200: "#cecdff",
          300: "#aba8ff",
          400: "#8179fc",
          500: "#6254f8",  // Primary brand
          600: "#5039ed",
          700: "#4429d9",
          800: "#3923b0",
          900: "#31218d",
          950: "#1e1460",
        },
        // Semantic
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        card:        "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        primary:     "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary:   "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted:       "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent:      "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        // Streak colors
        streak: {
          cold:   "#334155",
          warm:   "#7c3aed",
          hot:    "#f59e0b",
          fire:   "#ef4444",
        },
        // Completion heatmap
        heat: {
          0:   "#1e1e2e",
          25:  "#2d2b55",
          50:  "#4338ca",
          75:  "#6254f8",
          100: "#a78bfa",
        },
      },
      backgroundImage: {
        "forge-gradient": "linear-gradient(135deg, #6254f8 0%, #a78bfa 50%, #f0abfc 100%)",
        "forge-dark":     "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        "glow-purple":    "radial-gradient(circle at 50% 50%, rgba(98, 84, 248, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "fade-in":        "fadeIn 0.3s ease-in-out",
        "slide-up":       "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":       "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow":     "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flame":          "flame 1.5s ease-in-out infinite alternate",
        "xp-float":       "xpFloat 1s ease-out forwards",
        "completion-ring":"completionRing 0.6s ease-out forwards",
        "streak-glow":    "streakGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        flame: {
          "0%":   { transform: "scaleY(1) rotate(-2deg)", filter: "brightness(1)" },
          "100%": { transform: "scaleY(1.1) rotate(2deg)", filter: "brightness(1.3)" },
        },
        xpFloat: {
          "0%":   { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-40px)" },
        },
        completionRing: {
          "0%":   { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        streakGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)" },
          "50%":      { boxShadow: "0 0 25px rgba(245, 158, 11, 0.7)" },
        },
      },
      boxShadow: {
        "forge":      "0 0 0 1px rgba(98, 84, 248, 0.2), 0 4px 24px rgba(98, 84, 248, 0.15)",
        "forge-lg":   "0 0 0 1px rgba(98, 84, 248, 0.3), 0 8px 48px rgba(98, 84, 248, 0.25)",
        "glass":      "0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        "task-hover": "0 0 0 1px rgba(98, 84, 248, 0.4), 0 4px 16px rgba(98, 84, 248, 0.1)",
      },
      borderRadius: {
        "forge": "12px",
        "forge-lg": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
