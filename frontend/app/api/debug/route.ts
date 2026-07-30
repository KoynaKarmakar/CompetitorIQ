import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";

const LANGGRAPH_API_URL =
    process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";

// GET /api/debug?thread=<threadId>
// Shows exactly what keys are in the final thread state
export async function GET(req: NextRequest) {
    const threadId = req.nextUrl.searchParams.get("thread");
    if (!threadId) {
        return NextResponse.json({ error: "thread param required" }, { status: 400 });
    }

    try {
        const client = new Client({ apiUrl: LANGGRAPH_API_URL });
        const state = await client.threads.getState(threadId);
        const values = state.values as Record<string, unknown>;

        return NextResponse.json({
            keys: Object.keys(values),
            hasCompetitorIQReport: !!values.competitorIQReport,
            hasFinalReport: !!values.finalReport,
            competitorIQReport: values.competitorIQReport ?? null,
            finalReportPreview: typeof values.finalReport === "string"
                ? values.finalReport.slice(0, 300)
                : null,
        });
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Unknown error",
        }, { status: 500 });
    }
}
