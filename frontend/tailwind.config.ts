import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#07070A",
                surface: "#0F0F14",
                "surface-2": "#16161D",
                "surface-3": "#1E1E28",
                border: "#2A2A35",
                "border-glow": "#6D28D9",
                primary: "#7C3AED",
                "primary-light": "#A78BFA",
                "primary-glow": "rgba(124,58,237,0.3)",
                accent: "#8B5CF6",
                "text-primary": "#F8F8FF",
                "text-secondary": "#A0A0B8",
                "text-muted": "#5A5A72",
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-violet":
                    "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                "gradient-glow":
                    "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
                "card-gradient":
                    "linear-gradient(145deg, rgba(30,30,40,0.8) 0%, rgba(15,15,20,0.9) 100%)",
            },
            boxShadow: {
                glow: "0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.1)",
                "glow-sm": "0 0 10px rgba(124,58,237,0.3)",
                card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
                "spin-slow": "spin 8s linear infinite",
                float: "float 6s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
