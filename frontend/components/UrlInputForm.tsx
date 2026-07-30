"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

interface UrlInputFormProps {
    onSubmit: (url: string) => void;
    loading?: boolean;
}

export function UrlInputForm({ onSubmit, loading }: UrlInputFormProps) {
    const [url, setUrl] = useState("");
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmed = url.trim();
        if (!trimmed) {
            setError("Please enter a company URL");
            return;
        }

        const hasProtocol = /^https?:\/\//i.test(trimmed);
        const fullUrl = hasProtocol ? trimmed : `https://${trimmed}`;

        try {
            new URL(fullUrl);
            onSubmit(fullUrl);
        } catch {
            setError("Please enter a valid URL");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div
                className={cn(
                    "relative flex items-center rounded-2xl border transition-all duration-300 bg-surface",
                    focused
                        ? "border-primary shadow-glow"
                        : "border-border hover:border-border-glow"
                )}
            >
                {/* Globe icon */}
                <div className="pl-5 text-text-muted">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                        <path
                            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>

                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Enter company URL (e.g. notion.so)"
                    className="flex-1 bg-transparent px-4 py-4 text-text-primary placeholder:text-text-muted text-base focus:outline-none"
                    disabled={loading}
                />

                <div className="pr-2">
                    <Button
                        type="submit"
                        size="sm"
                        loading={loading}
                        className="rounded-xl"
                    >
                        {loading ? "Analyzing" : "Analyze"}
                    </Button>
                </div>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-danger text-center"
                >
                    {error}
                </motion.p>
            )}

            <p className="mt-3 text-center text-xs text-text-muted">
                Powered by Groq · Firecrawl · Qdrant · LangGraph
            </p>
        </form>
    );
}
