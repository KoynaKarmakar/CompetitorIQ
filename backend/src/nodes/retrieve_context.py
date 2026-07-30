"""
retrieve_context node — mirrors src/nodes/retrieveContext.ts
"""
from __future__ import annotations

import asyncio

from src.state import CompanyResearchState
from src.clients.embedding_client import embed_single
from src.clients.qdrant_client import qdrant_client, COLLECTION_NAME

TOP_K = 10


async def retrieve_context_node(state: CompanyResearchState) -> dict:
    print("[retrieveContext] Retrieving relevant context from Qdrant...")

    company = state.get("crawledData") and state["crawledData"].company
    competitors = state.get("researchedCompetitors") or []

    query_text = ". ".join([
        f"competitive analysis for {company.name if company else ''}",
        f"industry: {company.industry if company else ''}",
        f"competitors: {', '.join(c.name for c in competitors)}",
        "market positioning strengths weaknesses opportunities threats",
    ])

    try:
        query_vector = await embed_single(query_text)
        # Blocking client call — off the event loop (see qdrant_client.ensure_collection).
        results = await asyncio.to_thread(
            qdrant_client.search,
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=TOP_K,
            with_payload=True,
        )

        chunks = [
            f"[{r.payload.get('type')} | {r.payload.get('source')}]\n{r.payload.get('text')}"
            for r in results
            if r.payload and r.payload.get("text")
        ]
        retrieved_context = "\n\n---\n\n".join(chunks)
        print(f"[retrieveContext] Retrieved {len(chunks)} context chunks")
        return {"retrievedContext": retrieved_context}
    except Exception as err:
        print(f"[retrieveContext] Qdrant retrieval failed — continuing without context: {err}")
        return {"retrievedContext": "RAG context unavailable."}
