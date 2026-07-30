"""
generate_report node — mirrors src/nodes/generateReport.ts
Handles both initial generation and human-driven revisions.
"""
from __future__ import annotations
import json

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_json_client
from src.schema import CompetitorIQReport
from src.prompts import COMPETITIVE_REPORT_PROMPT, COMPETITIVE_REPORT_REVISION_PROMPT
from src.utils.json_parse import parse_json_response


async def generate_report_node(state: CompanyResearchState) -> dict:
    company = state.get("crawledData") and state["crawledData"].company
    competitors = state.get("researchedCompetitors") or []
    analysis = state.get("finalReport")
    retrieved_context = state.get("retrievedContext") or "No additional context."
    user_prompt_text = (state.get("userPrompt") or "").strip()
    is_revision = bool(user_prompt_text)

    print(f"[generateReport] is_revision={is_revision}")

    products = [p if isinstance(p, str) else p.name for p in (company.products or [])] if company else []
    key_persons = [kp.model_dump() for kp in (state["crawledData"].key_persons if state.get("crawledData") else [])]

    primary_company = json.dumps({
        "name": company.name if company else "",
        "url": state.get("userUrl", ""),
        "industry": company.industry if company else "",
        "mission": company.mission_statement if company else "",
        "target_market": company.target_market if company else "",
        "key_products": products,
        "notable_clients": company.notable_clients if company else [],
        "key_persons": key_persons,
    }, indent=2)

    competitors_json = json.dumps(
        [c.model_dump() for c in competitors], indent=2
    )

    if is_revision:
        current_report = ""
        if state.get("competitorIQReport"):
            current_report = state["competitorIQReport"].model_dump_json(indent=2)
        elif state.get("finalReport"):
            current_report = state["finalReport"]

        prompt = (
            COMPETITIVE_REPORT_REVISION_PROMPT
            .replace("{REVISION_PROMPT}", user_prompt_text)
            .replace("{CURRENT_REPORT}", current_report)
            .replace("{PRIMARY_COMPANY}", primary_company)
            .replace("{COMPETITORS}", competitors_json)
            .replace("{RETRIEVED_CONTEXT}", retrieved_context)
        )
    else:
        prompt = (
            COMPETITIVE_REPORT_PROMPT
            .replace("{PRIMARY_COMPANY}", primary_company)
            .replace("{COMPETITORS}", competitors_json)
            .replace("{ANALYSIS}", analysis or "{}")
            .replace("{RETRIEVED_CONTEXT}", retrieved_context)
        )

    response = await groq_json_client.ainvoke([SystemMessage(content=prompt)])
    text = response.content if isinstance(response.content, str) else json.dumps(response.content)
    parsed = parse_json_response(text, context="generate_report")
    report = CompetitorIQReport.model_validate(parsed)

    print("[generateReport] Report generated successfully")

    report_json = report.model_dump_json()
    return {
        "competitorIQReport": report,
        "finalReport": report_json,
        "reportRevisionsIncrement": 1 if is_revision else 0,
        "reportRevisions": [report_json] if is_revision else [],
    }
