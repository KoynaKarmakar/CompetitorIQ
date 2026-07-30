"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant = "primary", size = "md", loading, children, disabled, ...props },
        ref
    ) => {
        const base =
            "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "bg-gradient-violet text-white shadow-glow hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
            ghost:
                "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2",
            outline:
                "bg-transparent border border-border text-text-primary hover:border-primary hover:text-primary",
        };

        const sizes = {
            sm: "text-sm px-4 py-2 gap-1.5",
            md: "text-base px-6 py-3 gap-2",
            lg: "text-lg px-8 py-4 gap-2.5",
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.97 }}
                className={cn(base, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
            >
                {loading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
