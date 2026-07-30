"""
validate_url node — mirrors src/nodes/validateUrl.ts
"""
from __future__ import annotations
import re
from urllib.parse import urlparse

from src.state import CompanyResearchState

BLOCKED_DOMAINS = {
    "linkedin.com", "facebook.com", "youtube.com", "twitter.com",
    "instagram.com", "wikipedia.org", "amazon.com", "apple.com",
    "google.com", "microsoft.com", "github.com", "stackoverflow.com",
    "reddit.com", "quora.com", "medium.com", "pinterest.com",
    "tiktok.com", "snapchat.com",
}


def validate_url_node(state: CompanyResearchState) -> dict:
    url_input: str = state.get("userUrl", "")
    if not url_input or not isinstance(url_input, str):
        raise ValueError("URL is required and must be a string.")

    url_input = url_input.strip()

    # Auto-prepend https:// if missing
    if not re.match(r"^https?://", url_input, re.IGNORECASE):
        url_input = f"https://{url_input}"

    try:
        parsed = urlparse(url_input)
    except Exception:
        raise ValueError("URL is not well-formed.")

    if parsed.scheme != "https":
        raise ValueError("URL must use the HTTPS protocol.")

    hostname = parsed.hostname or ""
    # Strip www.
    hostname = re.sub(r"^www\.", "", hostname, flags=re.IGNORECASE)

    for domain in BLOCKED_DOMAINS:
        if hostname == domain or hostname.endswith(f".{domain}"):
            raise ValueError("URL domain is not allowed.")

    return {"validUrl": True, "userUrl": url_input}
