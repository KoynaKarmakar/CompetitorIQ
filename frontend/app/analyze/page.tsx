"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { CompetitorIQReport, AnalysisStatus } from "@/lib/types";

function AnalyzeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const url = searchParams.get("url") ?? "";

    const [status, setStatus] = useState<AnalysisStatus>("validating");
    const [error, setError] = useState("");
    const started = useRef(false);

    useEffect(() => {
        if (!url) { router.push("/"); return; }
        // Prevent double-invocation in React strict mode
        if (started.current) return;
        started.current = true;

        runAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    async function runAnalysis() {
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok || !res.body) {
                throw new Error(`Server error ${res.status}`);
            }

            // Read the SSE stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? ""; // keep incomplete line

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const json = line.slice(6).trim();
                    if (!json) continue;

                    try {
                        const event = JSON.parse(json) as {
                            type: string;
                            status?: AnalysisStatus;
                            report?: CompetitorIQReport;
                            message?: string;
                        };

                        if (event.type === "status" && event.status) {
                            setStatus(event.status);
                        }

                        if (event.type === "complete" && event.report) {
                            sessionStorage.setItem(
                                "competitorIQReport",
                                JSON.stringify(event.report)
                            );
                            setStatus("complete");
                            router.push("/report");
                            return;
                        }

                        if (event.type === "error") {
                            throw new Error(event.message ?? "Unknown error");
                        }
                    } catch (parseErr) {
                        // Skip malformed lines
                        console.warn("SSE parse error:", parseErr);
                    }
                }
            }
        } catch (err) {
            console.error("[analyze]", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Analysis failed. Make sure the backend is running."
            );
            setStatus("error");
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-40" />
            </div>

            <main className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20">
                {status === "error" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center max-w-md"
                    >
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-text-primary mb-2">
                            Analysis Failed
                        </h2>
                        <p className="text-text-secondary text-sm mb-2">{error}</p>
                        <p className="text-text-muted text-xs mb-6">
                            Make sure{" "}
                            <code className="bg-surface px-1 py-0.5 rounded text-primary-light">
                                langgraph dev --config langgraph.json
                            </code>{" "}
                            is running from the project root.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="text-primary-light hover:text-white text-sm underline"
                        >
                            ← Back to home
                        </button>
                    </motion.div>
                ) : (
                    <AnalysisLoader currentStatus={status} companyUrl={url} />
                )}
            </main>
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-text-muted text-sm animate-pulse">Loading…</div>
                </div>
            }
        >
            <AnalyzeContent />
        </Suspense>
    );
}
