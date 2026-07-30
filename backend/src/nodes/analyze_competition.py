"""
analyze_competition node — mirrors src/nodes/analyzeCompetition.ts
"""
from __future__ import annotations
import json

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_json_client
from src.schema import CompetitiveAnalysisOutput
from src.prompts import COMPETITIVE_ANALYSIS_PROMPT
from src.utils.json_parse import parse_json_response


async def analyze_competition_node(state: CompanyResearchState) -> dict:
    print("[analyzeCompetition] Running competitive analysis...")

    company = state.get("crawledData") and state["crawledData"].company
    if not company:
        raise ValueError("[analyzeCompetition] No company data in state")

    products = [p if isinstance(p, str) else p.name for p in (company.products or [])]

    primary_company = json.dumps({
        "name": company.name,
        "industry": company.industry,
        "mission": company.mission_statement,
        "target_market": company.target_market,
        "products": products,
        "notable_clients": company.notable_clients,
    }, indent=2)

    competitors = json.dumps(
        [c.model_dump() for c in (state.get("researchedCompetitors") or [])],
        indent=2,
    )
    retrieved_context = state.get("retrievedContext") or "No additional context."

    prompt = (
        COMPETITIVE_ANALYSIS_PROMPT
        .replace("{PRIMARY_COMPANY}", primary_company)
        .replace("{COMPETITORS}", competitors)
        .replace("{RETRIEVED_CONTEXT}", retrieved_context)
    )

    response = await groq_json_client.ainvoke([SystemMessage(content=prompt)])
    text = response.content if isinstance(response.content, str) else json.dumps(response.content)
    parsed = parse_json_response(text, context="analyze_competition")
    analysis = CompetitiveAnalysisOutput.model_validate(parsed)

    print("[analyzeCompetition] Analysis complete")
    # Store serialized analysis in finalReport — generateReport will consume it
    return {"finalReport": analysis.model_dump_json()}
