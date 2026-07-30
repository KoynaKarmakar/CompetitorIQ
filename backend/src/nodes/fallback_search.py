"""
fallback_search node — mirrors src/nodes/fallbackSearch.ts
LLM-based fallback when Firecrawl didn't return key persons.
"""
from __future__ import annotations
import json
import re

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_client


def _validate_search_for_key_persons(results: list[dict]) -> bool:
    """Return True if any result looks like a person (title contains CEO/CTO/founder etc.)."""
    person_keywords = {"ceo", "cto", "coo", "founder", "president", "director", "vp", "head"}
    for item in results:
        title_lower = item.get("title", "").lower()
        if any(kw in title_lower for kw in person_keywords):
            return True
    return False


def _strip_fences(text: str) -> str:
    return re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE).rstrip("` \n")


async def fallback_search_node(state: CompanyResearchState) -> dict:
    company_name = state.get("crawledData") and state["crawledData"].company.name
    if not company_name:
        print("[fallbackSearch] No company name, skipping")
        return {"fallbackSearchUsed": False}

    print(f"[fallbackSearch] LLM-based fallback for: {company_name}")

    prompt = f"""You are a company research assistant.

Based on your knowledge, provide information about the key leadership and competitors of "{company_name}".

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {{ "url": "https://linkedin.com/in/...", "title": "CEO Name - CEO at {company_name}", "description": "Brief description of the CEO..." }},
  {{ "url": "https://linkedin.com/in/...", "title": "CTO Name - CTO at {company_name}", "description": "Brief description..." }},
  {{ "url": "https://competitor.com", "title": "Competitor Company - Competitor of {company_name}", "description": "Why they compete..." }}
]"""

    try:
        response = await groq_client.ainvoke([SystemMessage(content=prompt)])
        text = response.content if isinstance(response.content, str) else json.dumps(response.content)
        parsed: list[dict] = json.loads(_strip_fences(text))

        search_results = [
            {"url": item.get("url", ""), "title": item.get("title", ""), "description": item.get("description", "")}
            for item in parsed
        ]
        valid = _validate_search_for_key_persons(search_results)
        print(f"[fallbackSearch] Got {len(search_results)} results, valid={valid}")
        return {
            "fallbackSearchUsed": True,
            "fallbackSearchKeyPersons": search_results,
            "validatedKeyPersons": valid,
        }
    except Exception as err:
        print(f"[fallbackSearch] LLM fallback failed: {err}")
        return {"fallbackSearchUsed": False}
