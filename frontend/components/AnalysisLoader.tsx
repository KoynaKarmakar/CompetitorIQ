"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ANALYSIS_STEPS, AnalysisStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnalysisLoaderProps {
    currentStatus: AnalysisStatus;
    companyUrl?: string;
}

export function AnalysisLoader({ currentStatus, companyUrl }: AnalysisLoaderProps) {
    const currentIndex = ANALYSIS_STEPS.findIndex((s) => s.id === currentStatus);

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-6 relative"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Analyzing{" "}
                    {companyUrl && (
                        <span className="gradient-violet-text">
                            {companyUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </span>
                    )}
                </h2>
                <p className="text-text-secondary text-sm">
                    Building your competitive intelligence report...
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                    const isDone = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                                isActive
                                    ? "border-primary/50 bg-primary/5 shadow-glow-sm"
                                    : isDone
                                        ? "border-success/20 bg-success/5"
                                        : "border-border bg-surface"
                            )}
                        >
                            {/* Status icon */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                                    isActive
                                        ? "bg-primary text-white"
                                        : isDone
                                            ? "bg-success/20 text-success"
                                            : "bg-surface-3 text-text-muted"
                                )}
                            >
                                {isDone ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : isActive ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-2 h-2 bg-white rounded-full"
                                    />
                                ) : (
                                    <span className="text-xs">{index + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        isActive
                                            ? "text-primary-light"
                                            : isDone
                                                ? "text-success"
                                                : "text-text-muted"
                                    )}
                                >
                                    {step.label}
                                </p>
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.p
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="text-xs text-text-muted mt-0.5"
                                        >
                                            {step.description}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Shimmer for active */}
                            {isActive && (
                                <div className="w-16 h-1.5 rounded-full bg-surface-3 overflow-hidden flex-shrink-0">
                                    <motion.div
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
