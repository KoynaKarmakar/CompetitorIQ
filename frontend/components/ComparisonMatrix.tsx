"use client";

import { motion } from "framer-motion";
import { CompetitorIQReport } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComparisonMatrixProps {
    report: CompetitorIQReport;
}

export function ComparisonMatrix({ report }: ComparisonMatrixProps) {
    const { comparison_summary, competitors, company } = report;
    const dimensions = Object.keys(comparison_summary);

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <span className="text-primary-light">◈</span> Comparison Matrix
            </h2>

            {/* Dimension summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {dimensions.map((dim, i) => (
                    <motion.div
                        key={dim}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="card-border rounded-xl p-4"
                    >
                        <p className="text-xs text-primary-light uppercase tracking-wider font-semibold mb-1 capitalize">
                            {dim.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {comparison_summary[dim]}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Feature table */}
            <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-2">
                            <th className="text-left px-4 py-3 text-text-muted font-medium w-40">Company</th>
                            <th className="text-left px-4 py-3 text-text-muted font-medium">Positioning</th>
                            <th className="text-left px-4 py-3 text-text-muted font-medium">Target</th>
                            <th className="text-left px-4 py-3 text-text-muted font-medium">Pricing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Primary company row */}
                        <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border bg-primary/5"
                        >
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span className="font-semibold text-primary-light truncate max-w-[120px]">
                                        {company.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-text-secondary">{report.market_position.slice(0, 80)}…</td>
                            <td className="px-4 py-3 text-text-secondary">{company.target_market}</td>
                            <td className="px-4 py-3 text-text-muted">—</td>
                        </motion.tr>

                        {/* Competitor rows */}
                        {competitors.map((c, i) => (
                            <motion.tr
                                key={c.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.06 }}
                                className={cn(
                                    "border-b border-border last:border-0",
                                    i % 2 === 0 ? "bg-surface" : "bg-surface-2"
                                )}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-border flex-shrink-0" />
                                        <span className="font-medium text-text-primary truncate max-w-[120px]">
                                            {c.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-text-secondary">
                                    {c.unique_positioning.slice(0, 80)}{c.unique_positioning.length > 80 ? "…" : ""}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">{c.target_audience}</td>
                                <td className="px-4 py-3 text-text-muted">{c.pricing || "—"}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
