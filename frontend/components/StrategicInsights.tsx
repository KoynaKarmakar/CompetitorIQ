"use client";

import { motion } from "framer-motion";
import { CompetitorIQReport } from "@/lib/types";

interface StrategicInsightsProps {
    report: CompetitorIQReport;
}

export function StrategicInsights({ report }: StrategicInsightsProps) {
    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="text-primary-light">◈</span> Strategic Recommendations
            </h2>
            <div className="space-y-3">
                {report.strategic_recommendations.map((rec, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.07 }}
                        className="flex items-start gap-4 card-border rounded-xl p-4"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-violet flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                            {i + 1}
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed pt-1">{rec}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
