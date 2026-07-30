"""
store_embeddings node — mirrors src/nodes/storeEmbeddings.ts
Chunks company + competitor text and upserts into Qdrant.
"""
from __future__ import annotations
import asyncio
import uuid

from qdrant_client.models import PointStruct

from src.state import CompanyResearchState
from src.clients.embedding_client import embed_texts
from src.clients.qdrant_client import qdrant_client, ensure_collection, COLLECTION_NAME


def _chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start: start + size])
        start += size - overlap
    return [c for c in chunks if len(c.strip()) > 10]


async def store_embeddings_node(state: CompanyResearchState) -> dict:
    print("[storeEmbeddings] Chunking and embedding content...")

    await ensure_collection()

    documents: list[dict] = []

    company = state.get("crawledData") and state["crawledData"].company
    if company:
        products_str = ", ".join(
            p if isinstance(p, str) else p.name
            for p in (company.products or [])
        )
        company_text = "\n".join([
            f"Company: {company.name}",
            f"Mission: {company.mission_statement}",
            f"Industry: {company.industry or ''}",
            f"Target market: {company.target_market}",
            f"Location: {company.location or ''}",
            f"Products: {products_str}",
            f"Notable clients: {', '.join(company.notable_clients or [])}",
        ])
        for chunk in _chunk_text(company_text):
            documents.append({"text": chunk, "source": company.url, "type": "primary_company"})

    for competitor in state.get("researchedCompetitors") or []:
        products_str = ", ".join(
            p if isinstance(p, str) else p.name
            for p in (competitor.products or [])
        )
        competitor_text = "\n".join([
            f"Competitor: {competitor.name}",
            f"Website: {competitor.website}",
            f"Target audience: {competitor.target_audience}",
            f"Unique positioning: {competitor.unique_positioning}",
            f"Pricing: {competitor.pricing or 'N/A'}",
            f"Key features: {', '.join(competitor.key_features)}",
            f"Products: {products_str}",
        ])
        for chunk in _chunk_text(competitor_text):
            documents.append({"text": chunk, "source": competitor.website, "type": "competitor"})

    if not documents:
        print("[storeEmbeddings] No documents to embed")
        return {}

    batch_size = 32
    points: list[PointStruct] = []
    for i in range(0, len(documents), batch_size):
        batch = documents[i: i + batch_size]
        vectors = await embed_texts([d["text"] for d in batch])
        for doc, vector in zip(batch, vectors):
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={"text": doc["text"], "source": doc["source"], "type": doc["type"]},
            ))

    # Blocking client call — off the event loop (see qdrant_client.ensure_collection).
    await asyncio.to_thread(
        qdrant_client.upsert, collection_name=COLLECTION_NAME, points=points
    )
    print(f"[storeEmbeddings] Stored {len(points)} vectors in Qdrant")
    return {}
