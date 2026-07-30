export interface Product {
    name: string;
    features?: string;
    pricing?: string;
}

export interface Competitor {
    name: string;
    website: string;
    products: Product[];
    target_audience: string;
    pricing?: string;
    unique_positioning: string;
    key_features: string[];
}

export interface SwotAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface CompetitorIQReport {
    executive_summary: string;
    company: {
        name: string;
        url: string;
        industry: string;
        mission: string;
        target_market: string;
        key_products: string[];
    };
    competitors: Competitor[];
    comparison_summary: Record<string, string>;
    swot_analysis: SwotAnalysis;
    market_position: string;
    strategic_recommendations: string[];
}

export type AnalysisStatus =
    | "idle"
    | "validating"
    | "extracting"
    | "discovering"
    | "researching"
    | "embedding"
    | "retrieving"
    | "analyzing"
    | "generating"
    | "complete"
    | "error";

export interface AnalysisStep {
    id: AnalysisStatus;
    label: string;
    description: string;
}

export const ANALYSIS_STEPS: AnalysisStep[] = [
    { id: "validating", label: "Validating URL", description: "Checking and normalising company URL" },
    { id: "extracting", label: "Extracting Company Data", description: "Crawling website with Firecrawl AI" },
    { id: "discovering", label: "Discovering Competitors", description: "Identifying top 3 competitors from 10 LLM candidates" },
    { id: "researching", label: "Researching Competitors", description: "Sequential scraping — stops once 3 succeed" },
    { id: "embedding", label: "Building Knowledge Base", description: "Chunking and embedding content into Qdrant" },
    { id: "retrieving", label: "Retrieving Context", description: "RAG retrieval of relevant evidence" },
    { id: "analyzing", label: "Analyzing Competition", description: "Generating SWOT and positioning analysis" },
    { id: "generating", label: "Generating Report", description: "Composing final competitive intelligence report" },
];
