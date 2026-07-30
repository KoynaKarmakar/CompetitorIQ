"use client";

import { motion } from "framer-motion";
import { SwotAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

const QUADRANTS = [
    {
        key: "strengths" as const,
        label: "Strengths",
        icon: "💪",
        color: "border-success/30 bg-success/5",
        dot: "bg-success",
        text: "text-success",
    },
    {
        key: "weaknesses" as const,
        label: "Weaknesses",
        icon: "⚠️",
        color: "border-warning/30 bg-warning/5",
        dot: "bg-warning",
        text: "text-warning",
    },
    {
        key: "opportunities" as const,
        label: "Opportunities",
        icon: "🚀",
        color: "border-primary/30 bg-primary/5",
        dot: "bg-primary",
        text: "text-primary-light",
    },
    {
        key: "threats" as const,
        label: "Threats",
        icon: "🔥",
        color: "border-danger/30 bg-danger/5",
        dot: "bg-danger",
        text: "text-danger",
    },
];

interface SwotSectionProps {
    swot: SwotAnalysis;
}

export function SwotSection({ swot }: SwotSectionProps) {
    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="text-primary-light">◈</span> SWOT Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUADRANTS.map((q, qi) => (
                    <motion.div
                        key={q.key}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: qi * 0.08 }}
                        className={cn("rounded-2xl border p-5", q.color)}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">{q.icon}</span>
                            <h3 className={cn("font-bold text-base", q.text)}>{q.label}</h3>
                            <span className={cn("ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-black/20", q.text)}>
                                {swot[q.key].length}
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {swot[q.key].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: qi * 0.08 + i * 0.04 }}
                                    className="flex items-start gap-2 text-sm text-text-secondary"
                                >
                                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", q.dot)} />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
