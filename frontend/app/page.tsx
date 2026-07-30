"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { UrlInputForm } from "@/components/UrlInputForm";

const EXAMPLE_COMPANIES = ["notion.so", "linear.app", "vercel.com", "stripe.com", "figma.com"];

const FEATURES = [
    { icon: "🔍", title: "Deep Company Research", desc: "Firecrawl extracts structured data from any company website" },
    { icon: "🏆", title: "Top 3 Competitors", desc: "LLM generates 10 candidates, scrapes sequentially, stops once 3 succeed" },
    { icon: "🧠", title: "RAG-powered Analysis", desc: "Qdrant vector store grounds analysis in real evidence" },
    { icon: "📊", title: "SWOT + Positioning", desc: "Comprehensive SWOT analysis and market positioning report" },
    { icon: "💬", title: "Ask-the-Market Chat", desc: "Conversational interface to explore your competitive landscape" },
    { icon: "⚡", title: "Groq Speed", desc: "Llama 3.3 70B running at inference speeds up to 750 tok/s" },
];

export default function LandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    function handleSubmit(url: string) {
        setLoading(true);
        const encoded = encodeURIComponent(url);
        router.push(`/analyze?url=${encoded}`);
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-glow opacity-60" />
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)" }}
                />
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#6D28D9 1px, transparent 1px), linear-gradient(90deg, #6D28D9 1px, transparent 1px)", backgroundSize: "80px 80px" }}
                />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-16">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center max-w-4xl mx-auto mb-12"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary-light mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        AI-Powered Competitive Intelligence
                    </motion.div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] mb-6 tracking-tight">
                        Know your{" "}
                        <span className="gradient-violet-text glow-text">competition</span>
                        <br />
                        in minutes.
                    </h1>

                    <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
                        Enter any company URL. CompetitorIQ automatically researches your top 5 competitors,
                        generates a SWOT analysis, and delivers a board-ready intelligence report — powered by
                        Groq, Firecrawl, and Qdrant.
                    </p>

                    <UrlInputForm onSubmit={handleSubmit} loading={loading} />

                    {/* Examples */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs text-text-muted">Try:</span>
                        {EXAMPLE_COMPANIES.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => handleSubmit(`https://${ex}`)}
                                className="text-xs text-primary-light hover:text-white bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full px-3 py-1 transition-all"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Features grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4"
                >
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.07 }}
                            className="card-border rounded-2xl p-5 hover:border-primary/30 transition-colors group"
                        >
                            <div className="text-2xl mb-3">{f.icon}</div>
                            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary-light transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tech stack pill */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted"
                >
                    {["LangGraph", "Groq llama-3.3-70b", "Firecrawl", "Qdrant", "HuggingFace Embeddings", "Next.js 15"].map((t) => (
                        <span key={t} className="bg-surface border border-border rounded-full px-3 py-1">
                            {t}
                        </span>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}
