"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CompetitorIQReport } from "@/lib/types";
import { Button } from "./ui/Button";

interface Message {
    role: "user" | "assistant";
    content: string;
}

/**
 * The model replies in markdown (bold, numbered lists, bullets). Rendering the
 * raw string showed literal ** markers and collapsed lists into one paragraph,
 * so assistant messages are parsed and styled to match the dark theme.
 */
function MarkdownMessage({ content }: { content: string }) {
    return (
        <div className="space-y-3">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                    strong: ({ children }) => (
                        <strong className="font-semibold text-text-primary">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 marker:text-primary-light marker:font-medium">
                            {children}
                        </ol>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-2 marker:text-primary-light">
                            {children}
                        </ul>
                    ),
                    li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                    h1: ({ children }) => (
                        <h1 className="text-base font-semibold text-text-primary">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-sm font-semibold text-text-primary">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-semibold text-text-primary">{children}</h3>
                    ),
                    code: ({ children }) => (
                        <code className="bg-surface px-1.5 py-0.5 rounded text-xs text-primary-light font-mono">
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="bg-surface rounded-lg p-3 overflow-x-auto text-xs">
                            {children}
                        </pre>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-light underline underline-offset-2 hover:text-white transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-border pl-3 italic text-text-muted">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="border-border" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

interface AskMarketChatProps {
    report: CompetitorIQReport;
}

function buildContext(report: CompetitorIQReport): string {
    return [
        `Company: ${report.company.name}`,
        `Industry: ${report.company.industry}`,
        `Mission: ${report.company.mission}`,
        `Market position: ${report.market_position}`,
        `Competitors: ${report.competitors.map((c) => `${c.name} (${c.unique_positioning})`).join("; ")}`,
        `Strengths: ${report.swot_analysis.strengths.join(", ")}`,
        `Weaknesses: ${report.swot_analysis.weaknesses.join(", ")}`,
        `Opportunities: ${report.swot_analysis.opportunities.join(", ")}`,
        `Threats: ${report.swot_analysis.threats.join(", ")}`,
        `Recommendations: ${report.strategic_recommendations.join("; ")}`,
    ].join("\n");
}

export function AskMarketChat({ report }: AskMarketChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `I have full context on **${report.company.name}** and its competitive landscape. Ask me anything — positioning strategy, competitor deep-dives, go-to-market advice, or market gaps.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const context = buildContext(report);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed, context }),
            });

            if (!res.ok) throw new Error("Chat API error");
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't process that. Make sure the backend is running.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[480px]">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-text-muted">RAG-powered · grounded in report data</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-gradient-violet text-white rounded-br-sm whitespace-pre-wrap"
                                        : "card-border text-text-secondary rounded-bl-sm"
                                    }`}
                            >
                                {msg.role === "assistant" ? (
                                    <MarkdownMessage content={msg.content} />
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="card-border rounded-2xl rounded-bl-sm px-4 py-3">
                            <div className="flex gap-1 items-center h-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.4, 1] }}
                                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                                        className="w-1.5 h-1.5 rounded-full bg-primary"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask about competitors, strategy, market gaps…"
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                />
                <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    size="sm"
                    className="px-4 rounded-xl flex-shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
