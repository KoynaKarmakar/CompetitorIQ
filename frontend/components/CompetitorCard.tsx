"use client";

import { motion } from "framer-motion";
import { Competitor } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { formatUrl } from "@/lib/utils";

interface CompetitorCardProps {
    competitor: Competitor;
    index: number;
}

export function CompetitorCard({ competitor, index }: CompetitorCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
        >
            <Card hoverable className="h-full flex flex-col gap-4">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-3 border border-border flex items-center justify-center font-bold text-primary-light text-sm">
                            {competitor.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-base truncate">{competitor.name}</CardTitle>
                            <a
                                href={competitor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-text-muted hover:text-primary-light transition-colors truncate block"
                            >
                                {formatUrl(competitor.website)}
                            </a>
                        </div>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">#{index + 1}</Badge>
                </CardHeader>

                {/* Positioning */}
                <div className="bg-surface-3 rounded-xl p-3">
                    <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Positioning</p>
                    <p className="text-sm text-text-primary leading-relaxed">
                        {competitor.unique_positioning}
                    </p>
                </div>

                {/* Key features */}
                {competitor.key_features.length > 0 && (
                    <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Key Features</p>
                        <div className="flex flex-wrap gap-1.5">
                            {competitor.key_features.slice(0, 4).map((f) => (
                                <Badge key={f} variant="purple" className="text-xs">{f}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Target + Pricing */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-surface rounded-lg p-2.5 border border-border">
                        <p className="text-xs text-text-muted mb-0.5">Target</p>
                        <p className="text-xs text-text-primary font-medium truncate">
                            {competitor.target_audience || "N/A"}
                        </p>
                    </div>
                    <div className="bg-surface rounded-lg p-2.5 border border-border">
                        <p className="text-xs text-text-muted mb-0.5">Pricing</p>
                        <p className="text-xs text-text-primary font-medium truncate">
                            {competitor.pricing || "Not listed"}
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
