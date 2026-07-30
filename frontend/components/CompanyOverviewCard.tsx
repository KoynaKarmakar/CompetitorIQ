"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { CompetitorIQReport } from "@/lib/types";

interface CompanyOverviewCardProps {
    report: CompetitorIQReport;
}

export function CompanyOverviewCard({ report }: CompanyOverviewCardProps) {
    const { company } = report;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card glow className="relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-glow opacity-50 pointer-events-none" />

                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-violet flex items-center justify-center text-white font-bold text-xl shadow-glow-sm">
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{company.name}</CardTitle>
                            <a
                                href={company.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-light hover:underline"
                            >
                                {company.url.replace(/^https?:\/\//, "")}
                            </a>
                        </div>
                    </div>
                    <Badge variant="purple">{company.industry}</Badge>
                </CardHeader>

                <p className="text-text-secondary text-sm leading-relaxed mb-5">
                    {company.mission}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-3 rounded-xl p-4">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Target Market</p>
                        <p className="text-sm text-text-primary font-medium">{company.target_market}</p>
                    </div>
                    <div className="bg-surface-3 rounded-xl p-4">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Key Products</p>
                        <p className="text-sm text-text-primary font-medium">
                            {company.key_products.slice(0, 3).join(", ")}
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Market Position</p>
                    <p className="text-sm text-text-primary">{report.market_position}</p>
                </div>
            </Card>
        </motion.div>
    );
}
