"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { CompanyOverviewCard } from "@/components/CompanyOverviewCard";
import { CompetitorCard } from "@/components/CompetitorCard";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { SwotSection } from "@/components/SwotSection";
import { StrategicInsights } from "@/components/StrategicInsights";
import { AskMarketChat } from "@/components/AskMarketChat";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card"; import { CompetitorIQReport } from "@/lib/types";

type Tab = "overview" | "competitors" | "comparison" | "swot" | "strategy" | "chat";

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🏢" },
    { id: "competitors", label: "Competitors", icon: "🏆" },
    { id: "comparison", label: "Comparison", icon: "📊" },
    { id: "swot", label: "SWOT", icon: "◈" },
    { id: "strategy", label: "Strategy", icon: "🎯" },
    { id: "chat", label: "Ask AI", icon: "💬" },
];

export default function ReportPage() {
    const router = useRouter();
    const [report, setReport] = useState<CompetitorIQReport | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    useEffect(() => {
        const stored = sessionStorage.getItem("competitorIQReport");
        if (!stored) {
            router.push("/");
            return;
        }
        try {
            setReport(JSON.parse(stored));
        } catch {
            router.push("/");
        }
    }, [router]);

    function handleExport() {
        if (!report) return;
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `competitor-iq-${report.company.name.toLowerCase().replace(/\s+/g, "-")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-text-muted text-sm animate-pulse">Loading report…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Top banner */}
            <div className="pt-20 px-4 pb-0">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6 border-b border-border"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-text-muted uppercase tracking-wider">
                                    Competitive Intelligence Report
                                </span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-xs text-success">Complete</span>
                            </div>
                            <h1 className="text-2xl font-bold text-text-primary">
                                {report.company.name}{" "}
                                <span className="gradient-violet-text">vs Market</span>
                            </h1>
                            <p className="text-text-secondary text-sm mt-1 max-w-xl leading-relaxed">
                                {report.executive_summary}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                                New Analysis
                            </Button>
                            <Button size="sm" onClick={handleExport}>
                                Export JSON
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Tab nav */}
            <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? "bg-primary/10 text-primary-light border border-primary/30"
                                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                                    }`}
                            >
                                <span className="text-base">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <CompanyOverviewCard report={report} />
                                </div>
                                <div className="space-y-4">
                                    {/* Quick stats */}
                                    <Card>
                                        <CardTitle className="mb-4 text-sm uppercase tracking-wider text-text-muted">
                                            Quick Stats
                                        </CardTitle>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-text-muted">Competitors analyzed</span>
                                                <span className="text-sm font-bold text-primary-light">
                                                    {report.competitors.length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-text-muted">Strengths identified</span>
                                                <span className="text-sm font-bold text-success">
                                                    {report.swot_analysis.strengths.length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-text-muted">Strategic recommendations</span>
                                                <span className="text-sm font-bold text-warning">
                                                    {report.strategic_recommendations.length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-text-muted">Threats identified</span>
                                                <span className="text-sm font-bold text-danger">
                                                    {report.swot_analysis.threats.length}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === "competitors" && (
                            <div>
                                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span className="text-primary-light">◈</span> Top{" "}
                                    {report.competitors.length} Competitors
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {report.competitors.map((c, i) => (
                                        <CompetitorCard key={c.name} competitor={c} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "comparison" && (
                            <ComparisonMatrix report={report} />
                        )}

                        {activeTab === "swot" && (
                            <SwotSection swot={report.swot_analysis} />
                        )}

                        {activeTab === "strategy" && (
                            <StrategicInsights report={report} />
                        )}

                        {activeTab === "chat" && (
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <span className="text-primary-light">◈</span> Ask the Market
                                </h2>
                                <p className="text-text-muted text-sm mb-6">
                                    RAG-powered chat grounded in your competitive intelligence data.
                                </p>
                                <Card>
                                    <AskMarketChat report={report} />
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
