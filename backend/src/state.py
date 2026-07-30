"""
Graph state — mirrors src/state.ts (LangGraph Annotation → TypedDict + operator).
"""
from __future__ import annotations

import operator
from typing import Annotated, Optional
from typing_extensions import TypedDict

from src.schema import (
    CompleteExtractedCompanyInfo,
    DiscoveredCompetitor,
    ResearchedCompetitor,
    CompetitorIQReport,
)


def _replace(_prev, next_val):
    """Reducer that always replaces with the new value."""
    return next_val


def _merge_competitors(
    prev: list[ResearchedCompetitor], next_val: list[ResearchedCompetitor]
) -> list[ResearchedCompetitor]:
    """Merge by name — same semantics as the TS reducer."""
    mapping = {c.name: c for c in prev}
    for c in next_val:
        mapping[c.name] = c
    return list(mapping.values())


class CompanyResearchState(TypedDict):
    # ── Core ──────────────────────────────────────────────────────────────────
    userUrl: str
    validUrl: bool
    crawledData: Optional[CompleteExtractedCompanyInfo]
    fallbackSearchUsed: bool
    validatedKeyPersons: bool
    fallbackSearchKeyPersons: Optional[list[dict]]
    finalReport: Optional[str]
    userAction: Optional[str]           # "accept" | "edit"
    userPrompt: Optional[str]

    # Reducers for accumulating fields
    reportRevisionsIncrement: Annotated[int, operator.add]
    reportRevisions: Annotated[list[str], operator.add]

    # ── CompetitorIQ ──────────────────────────────────────────────────────────
    discoveredCompetitors: Annotated[list[DiscoveredCompetitor], _replace]
    researchedCompetitors: Annotated[list[ResearchedCompetitor], _merge_competitors]
    retrievedContext: Annotated[str, _replace]
    competitorIQReport: Annotated[Optional[CompetitorIQReport], _replace]
