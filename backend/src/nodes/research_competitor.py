"""
research_competitor node — mirrors src/nodes/researchCompetitor.ts
Sequential scraping with early exit at TARGET_SUCCESSFUL = 3.
"""
from __future__ import annotations
import asyncio
import json
import re

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_json_client
from src.clients.firecrawl_client import firecrawl_client
from src.schema import DiscoveredCompetitor, ResearchedCompetitor
from src.prompts import COMPETITOR_RESEARCH_PROMPT
from src.utils.json_parse import parse_json_response

TARGET_SUCCESSFUL = 3


async def _research_single(competitor: DiscoveredCompetitor) -> ResearchedCompetitor | None:
    print(f"[researchCompetitor] Trying: {competitor.name} ({competitor.website})")

    clean_url = re.sub(r"/\*+$", "", competitor.website)
    scraped_text = ""

    try:
        # firecrawl-py returns the inner `data` object directly and raises on failure —
        # there is no `success` flag (that is the JS SDK's shape). Run the blocking
        # HTTP call off the event loop so the server's blocking-call detector allows it.
        result = await asyncio.to_thread(
            firecrawl_client.scrape_url, clean_url, params={"formats": ["markdown"]}
        )
        scraped_text = ((result or {}).get("markdown") or "")[:6000]
        if not scraped_text:
            print(f"[researchCompetitor] ✗ Empty response for {competitor.name}")
            return None
        print(f"[researchCompetitor] ✓ Scraped {competitor.name} ({len(scraped_text)} chars)")
    except Exception as err:
        print(f"[researchCompetitor] ✗ Scrape failed for {competitor.name}: {err}")
        return None

    if not scraped_text:
        return None

    prompt = (
        COMPETITOR_RESEARCH_PROMPT
        .replace("{COMPETITOR_NAME}", competitor.name)
        .replace("{COMPETITOR_URL}", competitor.website)
        .replace("{SCRAPED_DATA}", scraped_text)
    )

    try:
        response = await groq_json_client.ainvoke([SystemMessage(content=prompt)])
        text = response.content if isinstance(response.content, str) else json.dumps(response.content)
        parsed = parse_json_response(text, context=f"research_competitor({competitor.name})")
        return ResearchedCompetitor.model_validate(parsed)
    except Exception as err:
        print(f"[researchCompetitor] ✗ LLM extraction failed for {competitor.name}: {err}")
        return None


async def research_competitors_node(state: CompanyResearchState) -> dict:
    candidates = state.get("discoveredCompetitors") or []

    if not candidates:
        print("[researchCompetitors] No candidates to research")
        return {"researchedCompetitors": []}

    print(f"[researchCompetitors] Working through {len(candidates)} candidates, target={TARGET_SUCCESSFUL}")

    researched: list[ResearchedCompetitor] = []

    for candidate in candidates:
        if len(researched) >= TARGET_SUCCESSFUL:
            print(f"[researchCompetitors] ✓ Reached {TARGET_SUCCESSFUL} successes — stopping early")
            break

        result = await _research_single(candidate)
        if result:
            researched.append(result)
            print(f"[researchCompetitors] Progress: {len(researched)}/{TARGET_SUCCESSFUL} — added {result.name}")

    # Fallback: build minimal profiles if all scrapes failed
    if not researched:
        print("[researchCompetitors] All scrapes failed — using LLM-only fallback")
        for candidate in candidates[:TARGET_SUCCESSFUL]:
            researched.append(ResearchedCompetitor(
                name=candidate.name,
                website=candidate.website,
                products=[{"name": "Unknown — scrape failed"}],
                target_audience="Unknown",
                unique_positioning=candidate.reason,
                key_features=[],
            ))

    print(f"[researchCompetitors] Final: {len(researched)} competitors researched")
    return {"researchedCompetitors": researched}
