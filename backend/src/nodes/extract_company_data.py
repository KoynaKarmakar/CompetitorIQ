"""
extract_company_data node — mirrors src/nodes/extractCompanyData.ts
Scrapes the homepage with Firecrawl then uses the Groq LLM to extract structure.
"""
from __future__ import annotations
import asyncio
import json
import re

from langchain_core.messages import SystemMessage

from src.state import CompanyResearchState
from src.clients.groq_client import groq_json_client
from src.clients.firecrawl_client import firecrawl_client
from src.schema import CompleteExtractedCompanyInfo
from src.utils.json_parse import parse_json_response


def _validate_key_persons(data: CompleteExtractedCompanyInfo) -> bool:
    return bool(data.key_persons and len(data.key_persons) > 0)


async def firecrawl_extract_node(state: CompanyResearchState) -> dict:
    url: str = state["userUrl"].strip()
    # Strip wildcard suffix
    url = re.sub(r"/\*+$", "", url)

    print(f"[extractCompanyData] Scraping: {url}")

    markdown = ""
    try:
        # firecrawl-py returns the inner `data` object directly (markdown, metadata, …)
        # and raises on failure. It does NOT return a `success` flag like the JS SDK.
        #
        # scrape_url is a blocking HTTP call; it must run off the event loop or the
        # LangGraph server's blocking-call detector aborts the node.
        result = await asyncio.to_thread(
            firecrawl_client.scrape_url, url, params={"formats": ["markdown"]}
        )
        markdown = ((result or {}).get("markdown") or "")[:8000]
        print(f"[extractCompanyData] Scraped {len(markdown)} chars")
    except Exception as err:
        print(f"[extractCompanyData] Firecrawl scrape failed: {err}")
        return {"crawledData": None, "validatedKeyPersons": False}

    if not markdown:
        return {"crawledData": None, "validatedKeyPersons": False}

    prompt = f"""You are a data extraction expert.

Extract structured company information from the following scraped website content.

WEBSITE URL: {url}
SCRAPED CONTENT:
{markdown}

Return ONLY a valid JSON object — no markdown fences, no explanation:
{{
  "company": {{
    "url": "{url}",
    "name": "company name",
    "mission_statement": "mission or value proposition",
    "products": [{{"name": "...", "features": "...", "pricing": "..."}}],
    "target_market": "who they serve",
    "industry": "industry sector",
    "company_size": "employee count or size range if known",
    "location": "headquarters location if found",
    "logo": "logo image URL if found",
    "notable_clients": ["client1", "client2"],
    "case_studies": ["url1", "url2"],
    "recent_articles": ["url1", "url2"]
  }},
  "key_persons": [
    {{ "name": "...", "role": "...", "description": "...", "linkedIn_url": "", "email": "" }}
  ]
}}"""

    try:
        response = await groq_json_client.ainvoke([SystemMessage(content=prompt)])
        text = response.content if isinstance(response.content, str) else json.dumps(response.content)
        parsed = parse_json_response(text, context="extract_company_data")
        validated = CompleteExtractedCompanyInfo.model_validate(parsed)
        valid_persons = _validate_key_persons(validated)
        print(f"[extractCompanyData] Extracted: {validated.company.name}, keyPersonsValid={valid_persons}")
        return {"crawledData": validated, "validatedKeyPersons": valid_persons}
    except Exception as err:
        print(f"[extractCompanyData] LLM extraction failed: {err}")
        return {"crawledData": None, "validatedKeyPersons": False}
