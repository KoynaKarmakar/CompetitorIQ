"""
discover_competitors node — mirrors src/nodes/discoverCompetitors.ts
"""
from __future__ import annotations
import json

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_json_client
from src.schema import DiscoverCompetitorsOutput
from src.prompts import COMPETITOR_DISCOVERY_PROMPT
from src.utils.json_parse import parse_json_response


async def discover_competitors_node(state: CompanyResearchState) -> dict:
    company = state.get("crawledData") and state["crawledData"].company
    if not company:
        raise ValueError("[discoverCompetitors] No company data in state")

    products = [
        (p if isinstance(p, str) else p.name)
        for p in (company.products or [])
    ]

    company_profile = json.dumps({
        "name": company.name,
        "industry": company.industry or "Unknown",
        "products": products,
        "target_market": company.target_market,
        "mission": company.mission_statement,
        "location": company.location,
    }, indent=2)

    prompt = COMPETITOR_DISCOVERY_PROMPT.replace("{COMPANY_PROFILE}", company_profile)

    print("[discoverCompetitors] Calling LLM...")
    response = await groq_json_client.ainvoke([SystemMessage(content=prompt)])
    text = response.content if isinstance(response.content, str) else json.dumps(response.content)
    parsed = parse_json_response(text, context="discover_competitors")
    validated = DiscoverCompetitorsOutput.model_validate(parsed)

    competitors = validated.competitors[:10]
    print(f"[discoverCompetitors] Discovered {len(competitors)} candidates: {', '.join(c.name for c in competitors)}")
    return {"discoveredCompetitors": competitors}
