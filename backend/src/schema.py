"""
Pydantic schemas — mirrors src/schema.ts (zod → pydantic v2).
"""
from __future__ import annotations

from typing import Optional, Union
from pydantic import BaseModel, field_validator


# ─── Base ─────────────────────────────────────────────────────────────────────

class Product(BaseModel):
    name: str
    features: Optional[str] = None
    pricing: Optional[str] = None


class ExtractedKeyPerson(BaseModel):
    name: str
    role: str
    description: Optional[str] = None
    linkedIn_url: Optional[str] = None
    email: Optional[str] = None


class ExtractedCompanyInfo(BaseModel):
    url: str
    name: str
    mission_statement: str
    products: list[Union[Product, str]]
    target_market: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    logo: Optional[str] = None
    notable_clients: Optional[list[str]] = None
    case_studies: Optional[list[str]] = None
    recent_articles: Optional[list[Union[str, dict]]] = None


class CompleteExtractedCompanyInfo(BaseModel):
    company: ExtractedCompanyInfo
    key_persons: list[ExtractedKeyPerson]


class FallbackSearchItem(BaseModel):
    url: str
    title: str
    description: str


# ─── CompetitorIQ ─────────────────────────────────────────────────────────────

class DiscoveredCompetitor(BaseModel):
    name: str
    website: str
    reason: str


class DiscoverCompetitorsOutput(BaseModel):
    competitors: list[DiscoveredCompetitor]


class ResearchedCompetitor(BaseModel):
    name: str
    website: str
    products: list[Union[Product, str]]
    target_audience: str
    pricing: Optional[str] = None
    unique_positioning: str
    key_features: list[str]


class SwotAnalysis(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    opportunities: list[str]
    threats: list[str]


class CompetitiveAnalysisOutput(BaseModel):
    market_positioning_summary: str
    key_differentiators: list[str]
    competitive_advantages: list[str]
    competitive_weaknesses: list[str]
    swot: SwotAnalysis


class CompanySection(BaseModel):
    name: str
    url: str
    industry: str
    mission: str
    target_market: str
    key_products: list[str]


class CompetitorIQReport(BaseModel):
    company: CompanySection
    competitors: list[ResearchedCompetitor]
    comparison_summary: dict[str, str]
    swot_analysis: SwotAnalysis
    market_position: str
    strategic_recommendations: list[str]
    executive_summary: str
