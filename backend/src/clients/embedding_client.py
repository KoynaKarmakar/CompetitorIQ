"""
Hash-based pseudo-embedding client — mirrors src/clients/embeddingClient.ts.
Deterministic, offline, no model download required.
Dimensions: 384 (matches Qdrant collection).
"""
from __future__ import annotations
import math

VECTOR_SIZE = 384


def _hash_embed(text: str) -> list[float]:
    vec = [0.0] * VECTOR_SIZE
    normalized = " ".join(text.lower().split())
    words = normalized.split(" ")

    for word in words:
        h = 5381
        for ch in word:
            h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
        idx = abs(h) % VECTOR_SIZE
        vec[idx] += 1.0

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def embed_texts(texts: list[str]) -> list[list[float]]:
    return [_hash_embed(t) for t in texts]


async def embed_single(text: str) -> list[float]:
    return _hash_embed(text)
