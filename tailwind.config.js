/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        violet: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        lumio: {
          dark: "var(--lumio-dark)",
          card: "var(--lumio-card)",
          hover: "var(--lumio-hover)",
          border: "var(--lumio-border)",
          glow: "var(--lumio-glow)",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        purple: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", filter: "blur(20px)" },
          "50%": { opacity: "0.8", filter: "blur(25px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        cosmicShine: {
          "0%, 100%": { left: "-100%" },
          "50%": { left: "100%" },
        },
        auroraFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        nebulaPulse: {
          "0%, 100%": { opacity: "0.3", transform: "scaleX(1)" },
          "50%": { opacity: "0.6", transform: "scaleX(1.2)" },
        },
        plasmaGlow: {
          "0%, 100%": { 
            boxShadow: "0 0 10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 15px rgba(236, 72, 153, 0.5), 0 0 30px rgba(99, 102, 241, 0.4)" 
          },
        },
        cosmicRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        auroraShine: {
          "0%, 100%": { top: "-100%" },
          "50%": { top: "100%" },
        },
        nebulaShine: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.2)" },
        },
        plasmaShine: {
          "0%, 100%": { left: "-100%", right: "100%" },
          "50%": { left: "100%", right: "-100%" },
        },
        liquidShine: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20%, 20%) scale(1.1)" },
          "50%": { transform: "translate(0, 40%) scale(1)" },
          "75%": { transform: "translate(-20%, 20%) scale(1.1)" },
        },
        morphingShine: {
          "0%, 100%": { backgroundPosition: "0% 50%", filter: "hue-rotate(0deg)" },
          "25%": { backgroundPosition: "50% 100%", filter: "hue-rotate(30deg)" },
          "50%": { backgroundPosition: "100% 50%", filter: "hue-rotate(60deg)" },
          "75%": { backgroundPosition: "50% 0%", filter: "hue-rotate(30deg)" },
        },
        floatEnhanced: {
          "0%, 100%": { transform: "translateY(0) rotateX(0deg) rotateY(0deg)" },
          "25%": { transform: "translateY(-10px) rotateX(2deg) rotateY(2deg)" },
          "50%": { transform: "translateY(-20px) rotateX(0deg) rotateY(0deg)" },
          "75%": { transform: "translateY(-10px) rotateX(-2deg) rotateY(-2deg)" },
        },
        morphShape: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 60% / 30% 60% 70% 40%" },
          "75%": { borderRadius: "60% 40% 60% 30% / 70% 30% 50% 60%" },
        },
        liquidMorph: {
          "0%, 100%": { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", transform: "rotate(0deg)" },
          "25%": { borderRadius: "58% 42% 75% 25% / 76% 46% 54% 24%", transform: "rotate(5deg)" },
          "50%": { borderRadius: "50% 50% 33% 67% / 55% 27% 73% 45%", transform: "rotate(0deg)" },
          "75%": { borderRadius: "33% 67% 58% 42% / 63% 68% 32% 37%", transform: "rotate(-5deg)" },
        },
        glowMultiPulse: {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(99, 102, 241, 0.3), 0 0 10px rgba(99, 102, 241, 0.2), 0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.1), 0 0 80px rgba(99, 102, 241, 0.05)" 
          },
          "50%": { 
            boxShadow: "0 0 10px rgba(99, 102, 241, 0.4), 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2), 0 0 60px rgba(99, 102, 241, 0.15), 0 0 100px rgba(99, 102, 241, 0.1)" 
          },
        },
        glowAurora: {
          "0%, 100%": { 
            boxShadow: "0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(59, 130, 246, 0.2), 0 0 30px rgba(168, 85, 247, 0.15)" 
          },
          "33%": { 
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.4), 0 0 25px rgba(168, 85, 247, 0.3), 0 0 35px rgba(236, 72, 153, 0.2)" 
          },
          "66%": { 
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.35), 0 0 22px rgba(236, 72, 153, 0.25), 0 0 32px rgba(34, 197, 94, 0.15)" 
          },
        },
        glowInnerPulse: {
          "0%, 100%": { 
            boxShadow: "inset 0 0 20px rgba(99, 102, 241, 0.2), inset 0 0 40px rgba(99, 102, 241, 0.1)" 
          },
          "50%": { 
            boxShadow: "inset 0 0 30px rgba(99, 102, 241, 0.3), inset 0 0 50px rgba(99, 102, 241, 0.2)" 
          },
        },
        noiseMove: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-33.33%, -33.33%)" },
        },
        grainShift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -1%)" },
          "20%": { transform: "translate(1%, 1%)" },
          "30%": { transform: "translate(-1%, 1%)" },
          "40%": { transform: "translate(1%, -1%)" },
          "50%": { transform: "translate(-1%, 0%)" },
          "60%": { transform: "translate(1%, 0%)" },
          "70%": { transform: "translate(0%, 1%)" },
          "80%": { transform: "translate(0%, -1%)" },
          "90%": { transform: "translate(1%, 1%)" },
        },
        cosmicDust: {
          "0%": { backgroundPosition: "0 0, 25px 25px, 50px 50px" },
          "100%": { backgroundPosition: "50px 50px, 75px 75px, 100px 100px" },
        },
        auroraWaves: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "25%": { backgroundPosition: "50% 100%" },
          "50%": { backgroundPosition: "100% 50%" },
          "75%": { backgroundPosition: "50% 0%" },
        },
        liquidFlow: {
          "0%, 100%": { backgroundPosition: "0% 0%, 100% 100%, 50% 50%", backgroundSize: "200% 200%" },
          "50%": { backgroundPosition: "100% 100%, 0% 0%, 50% 50%", backgroundSize: "220% 220%" },
        },
        cosmicCornerPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        auroraCornerSlide: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        neonBorderPulse: {
          "0%, 100%": { 
            opacity: "0.7",
            boxShadow: "0 0 10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)" 
          },
          "50%": { 
            opacity: "1",
            boxShadow: "0 0 15px rgba(236, 72, 153, 0.5), 0 0 30px rgba(99, 102, 241, 0.4)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "float": "float 5s ease-in-out infinite",
        "cosmic-shine": "cosmicShine 4s ease-in-out infinite",
        "aurora-flow": "auroraFlow 8s ease-in-out infinite",
        "nebula-pulse": "nebulaPulse 6s ease-in-out infinite",
        "plasma-glow": "plasmaGlow 3s ease-in-out infinite",
        "cosmic-rotate": "cosmicRotate 8s linear infinite",
        "aurora-shine": "auroraShine 6s ease-in-out infinite",
        "nebula-shine": "nebulaShine 5s ease-in-out infinite",
        "plasma-shine": "plasmaShine 3s ease-in-out infinite",
        "liquid-shine": "liquidShine 8s ease-in-out infinite",
        "morphing-shine": "morphingShine 10s ease-in-out infinite",
        "float-enhanced": "floatEnhanced 6s ease-in-out infinite",
        "morph-shape": "morphShape 8s ease-in-out infinite",
        "liquid-morph": "liquidMorph 10s ease-in-out infinite",
        "glow-multi-pulse": "glowMultiPulse 4s ease-in-out infinite",
        "glow-aurora": "glowAurora 5s ease-in-out infinite",
        "glow-inner-pulse": "glowInnerPulse 3s ease-in-out infinite",
        "noise-move": "noiseMove 20s linear infinite",
        "grain-shift": "grainShift 0.5s steps(10) infinite",
        "cosmic-dust": "cosmicDust 20s linear infinite",
        "aurora-waves": "auroraWaves 15s ease-in-out infinite",
        "liquid-flow": "liquidFlow 10s ease-in-out infinite",
        "cosmic-corner-pulse": "cosmicCornerPulse 4s ease-in-out infinite",
        "aurora-corner-slide": "auroraCornerSlide 3s ease-in-out infinite",
        "neon-border-pulse": "neonBorderPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
