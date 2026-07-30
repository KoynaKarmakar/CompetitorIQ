import { NextRequest } from "next/server";
import { Client } from "@langchain/langgraph-sdk";

const LANGGRAPH_API_URL =
    process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";

const NODE_TO_STATUS: Record<string, string> = {
    validate_url: "validating",
    firecrawl_extract: "extracting",
    fallback_search: "extracting",
    discover_competitors: "discovering",
    research_competitors: "researching",
    store_embeddings: "embedding",
    retrieve_context: "retrieving",
    analyze_competition: "analyzing",
    generate_report: "generating",
};

export async function POST(req: NextRequest) {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
        return new Response(
            `data: ${JSON.stringify({ type: "error", message: "URL is required" })}\n\n`,
            { status: 400, headers: { "Content-Type": "text/event-stream" } }
        );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            function send(data: object) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                );
            }

            try {
                const client = new Client({ apiUrl: LANGGRAPH_API_URL });
                const thread = await client.threads.create();
                const threadId = thread.thread_id;

                send({ type: "status", status: "validating" });

                // Collect the latest values snapshot from the stream itself
                let latestValues: Record<string, unknown> = {};

                const runStream = client.runs.stream(threadId, "competitor-iq", {
                    input: { userUrl: url },
                    streamMode: ["updates", "values"],
                });

                for await (const chunk of runStream) {
                    // Status updates from node completions
                    if (chunk.event === "updates" && chunk.data) {
                        const nodeNames = Object.keys(chunk.data as Record<string, unknown>);
                        for (const nodeName of nodeNames) {
                            const status = NODE_TO_STATUS[nodeName];
                            if (status) send({ type: "status", status });
                        }
                    }

                    // Keep the latest full state snapshot
                    if (chunk.event === "values" && chunk.data) {
                        latestValues = chunk.data as Record<string, unknown>;
                    }
                }

                // Try to get report from the stream's last values snapshot first
                let report = latestValues?.competitorIQReport ?? null;

                // Fallback: parse from finalReport string
                if (!report && latestValues?.finalReport) {
                    try {
                        report = JSON.parse(latestValues.finalReport as string);
                    } catch { /* ignore */ }
                }

                // Last resort: fetch thread state from API
                if (!report) {
                    const threadState = await client.threads.getState(threadId);
                    const sv = threadState.values as Record<string, unknown>;

                    report = sv?.competitorIQReport ?? null;

                    if (!report && sv?.finalReport) {
                        try {
                            report = JSON.parse(sv.finalReport as string);
                        } catch { /* ignore */ }
                    }
                }

                if (report) {
                    send({ type: "complete", report });
                } else {
                    send({
                        type: "error",
                        message: "Graph completed but report was empty. Check backend logs.",
                    });
                }
            } catch (err) {
                console.error("[/api/analyze]", err);
                send({
                    type: "error",
                    message:
                        err instanceof Error
                            ? err.message
                            : "Analysis failed. Is the LangGraph backend running?",
                });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
