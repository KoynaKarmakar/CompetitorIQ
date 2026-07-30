#!/usr/bin/env python3
"""
Quick local demo — runs the graph directly without the LangGraph server.
Usage:
    python backend/demo.py https://firecrawl.dev
"""
import asyncio
import json
import sys
from dotenv import load_dotenv

load_dotenv()

from src.graph import company_researcher_graph  # noqa: E402


async def main(url: str) -> None:
    print(f"\n=== CompetitorIQ (Python) ===\nAnalyzing: {url}\n")

    result = await company_researcher_graph.ainvoke(
        {"userUrl": url},
        config={"recursion_limit": 50},
    )

    report = result.get("competitorIQReport")
    if report:
        print(json.dumps(
            report.model_dump() if hasattr(report, "model_dump") else report,
            indent=2,
        ))
    else:
        print("No report generated. Check logs above.")


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://firecrawl.dev"
    asyncio.run(main(target_url))
