"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    hoverable?: boolean;
}

export function Card({ children, className, glow, hoverable }: CardProps) {
    return (
        <motion.div
            whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
            transition={{ duration: 0.2 }}
            className={cn(
                "card-border rounded-2xl p-6",
                glow && "shadow-glow-sm",
                hoverable && "cursor-pointer",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("mb-4 flex items-start justify-between", className)}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={cn("text-lg font-semibold text-text-primary", className)}>
            {children}
        </h3>
    );
}
