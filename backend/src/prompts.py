"""
All LLM prompt templates.

These are plain strings filled in with str.replace(), NOT f-strings or
str.format(). Braces must therefore be written singly — doubling them would
send literal `{{` to the model inside what is meant to be a JSON example.
Placeholders are the single-braced ALL_CAPS tokens.
"""

COMPETITOR_RESEARCH_PROMPT = """
You are a market research analyst.

Based on the following web data about {COMPETITOR_NAME} ({COMPETITOR_URL}), extract structured competitive intelligence.

SCRAPED DATA:
{SCRAPED_DATA}

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "name": "{COMPETITOR_NAME}",
  "website": "{COMPETITOR_URL}",
  "products": [{ "name": "...", "features": "...", "pricing": "..." }],
  "target_audience": "...",
  "pricing": "...",
  "unique_positioning": "...",
  "key_features": ["feature1", "feature2"]
}
"""

COMPETITIVE_ANALYSIS_PROMPT = """
You are a senior competitive intelligence strategist.

Analyze the following primary company against its competitors using the retrieved context and research data.

PRIMARY COMPANY:
{PRIMARY_COMPANY}

COMPETITORS:
{COMPETITORS}

RETRIEVED CONTEXT (evidence from web):
{RETRIEVED_CONTEXT}

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "market_positioning_summary": "...",
  "key_differentiators": ["...", "..."],
  "competitive_advantages": ["...", "..."],
  "competitive_weaknesses": ["...", "..."],
  "swot": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  }
}
"""

COMPETITOR_DISCOVERY_PROMPT = """
You are a competitive intelligence expert.

Given the following company profile, identify exactly 10 of the most relevant direct competitors, ordered from most to least relevant.

COMPANY PROFILE:
{COMPANY_PROFILE}

Return ONLY a valid JSON object in this exact format — no markdown, no explanation.
Return exactly 10 entries in the "competitors" array:
{
  "competitors": [
    { "name": "CompanyName1", "website": "https://example1.com", "reason": "why they are a competitor" },
    { "name": "CompanyName2", "website": "https://example2.com", "reason": "why they are a competitor" }
  ]
}
"""

COMPETITIVE_REPORT_PROMPT = """
You are a world-class competitive intelligence analyst producing a board-level report.

PRIMARY COMPANY DATA:
{PRIMARY_COMPANY}

COMPETITORS:
{COMPETITORS}

COMPETITIVE ANALYSIS:
{ANALYSIS}

RETRIEVED CONTEXT:
{RETRIEVED_CONTEXT}

Generate a comprehensive competitive intelligence report.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "executive_summary": "3-5 sentence summary of findings",
  "company": {
    "name": "...",
    "url": "...",
    "industry": "...",
    "mission": "...",
    "target_market": "...",
    "key_products": ["product1", "product2"]
  },
  "competitors": [
    {
      "name": "...",
      "website": "...",
      "products": [{ "name": "...", "features": "...", "pricing": "..." }],
      "target_audience": "...",
      "pricing": "...",
      "unique_positioning": "...",
      "key_features": ["..."]
    }
  ],
  "comparison_summary": {
    "pricing": "...",
    "features": "...",
    "market_reach": "...",
    "technology": "..."
  },
  "swot_analysis": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "market_position": "...",
  "strategic_recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}
"""

COMPETITIVE_REPORT_REVISION_PROMPT = """
You are a senior competitive intelligence analyst revising a report based on feedback.

REVISION INSTRUCTIONS:
{REVISION_PROMPT}

CURRENT REPORT:
{CURRENT_REPORT}

PRIMARY COMPANY DATA:
{PRIMARY_COMPANY}

COMPETITORS:
{COMPETITORS}

RETRIEVED CONTEXT:
{RETRIEVED_CONTEXT}

Return the revised report as ONLY a valid JSON object — no markdown, no explanation.
Use the exact same schema as the current report.
"""
