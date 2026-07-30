"""
CompetitorIQ LangGraph — Python port of src/companyResearcherGraph.ts.

Graph topology (identical to the TS version):

  START
    → validate_url
    → [valid?] firecrawl_extract | END
    → [key_persons?] discover_competitors | fallback_search
    → [fallback ok?] discover_competitors | END
    → research_competitors
    → store_embeddings
    → retrieve_context
    → analyze_competition
    → generate_report
    → END
"""
from __future__ import annotations

from langgraph.graph import StateGraph, END, START

from src.state import CompanyResearchState
from src.nodes.validate_url import validate_url_node
from src.nodes.extract_company_data import firecrawl_extract_node
from src.nodes.fallback_search import fallback_search_node
from src.nodes.discover_competitors import discover_competitors_node
from src.nodes.research_competitor import research_competitors_node
from src.nodes.store_embeddings import store_embeddings_node
from src.nodes.retrieve_context import retrieve_context_node
from src.nodes.analyze_competition import analyze_competition_node
from src.nodes.generate_report import generate_report_node


# ─── Routing functions ────────────────────────────────────────────────────────

def route_after_validate_url(state: CompanyResearchState) -> str:
    return "firecrawl_extract" if state.get("validUrl") else END


def route_after_extracting_data(state: CompanyResearchState) -> str:
    return "discover_competitors" if state.get("validatedKeyPersons") else "fallback_search"


def route_after_fallback_search(state: CompanyResearchState) -> str:
    crawled = state.get("crawledData")
    return "discover_competitors" if (crawled and crawled.company) else END


# ─── Graph construction ───────────────────────────────────────────────────────

_builder = StateGraph(CompanyResearchState)

_builder.add_node("validate_url", validate_url_node)
_builder.add_node("firecrawl_extract", firecrawl_extract_node)
_builder.add_node("fallback_search", fallback_search_node)
_builder.add_node("discover_competitors", discover_competitors_node)
_builder.add_node("research_competitors", research_competitors_node)
_builder.add_node("store_embeddings", store_embeddings_node)
_builder.add_node("retrieve_context", retrieve_context_node)
_builder.add_node("analyze_competition", analyze_competition_node)
_builder.add_node("generate_report", generate_report_node)

_builder.add_edge(START, "validate_url")
_builder.add_conditional_edges(
    "validate_url",
    route_after_validate_url,
    ["firecrawl_extract", END],
)
_builder.add_conditional_edges(
    "firecrawl_extract",
    route_after_extracting_data,
    ["fallback_search", "discover_competitors"],
)
_builder.add_conditional_edges(
    "fallback_search",
    route_after_fallback_search,
    ["discover_competitors", END],
)
_builder.add_edge("discover_competitors", "research_competitors")
_builder.add_edge("research_competitors", "store_embeddings")
_builder.add_edge("store_embeddings", "retrieve_context")
_builder.add_edge("retrieve_context", "analyze_competition")
_builder.add_edge("analyze_competition", "generate_report")
_builder.add_edge("generate_report", END)

# Compiled graph — exported for langgraph.json and direct use
company_researcher_graph = _builder.compile()
company_researcher_graph.name = "competitor-iq-graph"
