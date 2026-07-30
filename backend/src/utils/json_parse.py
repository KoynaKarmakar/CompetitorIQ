"""
Robust extraction of a JSON object from an LLM response.

The models are asked for bare JSON and the client requests JSON mode, but
responses still occasionally arrive wrapped in ``` fences or prefixed with
a sentence of commentary. Anchoring a regex at the start of the string (the
previous approach) fails on any preamble, so parsing is done by scanning for
the first balanced top-level object instead.
"""
from __future__ import annotations

import json
import re
from typing import Any

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


def _find_balanced_object(text: str) -> str | None:
    """Return the first brace-balanced JSON object, ignoring braces in strings."""
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escaped = False

    for i in range(start, len(text)):
        ch = text[i]

        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]

    return None


def parse_json_response(text: str, *, context: str = "LLM response") -> dict[str, Any]:
    """
    Parse a JSON object out of an LLM response.

    Tries, in order: the raw text, the contents of a ``` fence, and the first
    brace-balanced object anywhere in the text.

    Raises ValueError with a truncated snippet of the offending response so
    failures are diagnosable from the logs.
    """
    candidates: list[str] = []

    stripped = text.strip()
    if stripped:
        candidates.append(stripped)

    fenced = _FENCE_RE.search(text)
    if fenced:
        candidates.append(fenced.group(1).strip())

    balanced = _find_balanced_object(text)
    if balanced:
        candidates.append(balanced)

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            continue
        if isinstance(parsed, dict):
            return parsed

    snippet = text.strip()[:400].replace("\n", " ")
    raise ValueError(f"{context}: could not parse a JSON object. Got: {snippet!r}")
