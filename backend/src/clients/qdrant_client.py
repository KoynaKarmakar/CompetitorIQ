"""
Qdrant vector store client.
"""
import asyncio
import os
from urllib.parse import urlparse, urlunparse

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

load_dotenv()

COLLECTION_NAME = "competitor_iq"
VECTOR_SIZE = 384  # must match embedding_client.VECTOR_SIZE
DEFAULT_REST_PORT = 6333


def _normalize_url(raw: str) -> str:
    """
    Qdrant serves its REST API on port 6333. Qdrant Cloud dashboard URLs are
    copied without a port, which silently resolves to :443 and returns a 404
    HTML page instead of the API. Default the port when one isn't given.
    """
    parsed = urlparse(raw)
    if parsed.scheme and not parsed.port and parsed.hostname:
        netloc = f"{parsed.hostname}:{DEFAULT_REST_PORT}"
        parsed = parsed._replace(netloc=netloc)
        return urlunparse(parsed)
    return raw


_url = _normalize_url(os.getenv("QDRANT_URL", "http://localhost:6333"))
_api_key = os.getenv("QDRANT_API_KEY")  # required for Qdrant Cloud, optional locally

qdrant_client = QdrantClient(
    url=_url,
    **({"api_key": _api_key} if _api_key else {}),
)


async def ensure_collection() -> None:
    """
    Create the collection if it doesn't exist.

    Uses collection_exists() rather than get_collection(): the latter parses the
    full collection config, and a server newer than the pinned client returns
    fields the client's model rejects (e.g. strict_mode_config.max_payload_index_count
    -> extra_forbidden). The exists endpoint returns a plain boolean and is
    unaffected by that version skew.

    QdrantClient is synchronous, so its calls are pushed to a worker thread —
    blocking I/O on the event loop is rejected by the LangGraph server.
    """
    if await asyncio.to_thread(qdrant_client.collection_exists, COLLECTION_NAME):
        print(f'[Qdrant] Collection "{COLLECTION_NAME}" already exists')
        return

    await asyncio.to_thread(
        qdrant_client.create_collection,
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    print(f'[Qdrant] Created collection "{COLLECTION_NAME}"')
