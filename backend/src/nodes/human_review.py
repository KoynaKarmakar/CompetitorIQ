"""
human_review node — mirrors src/nodes/humanReview.ts
Uses LangGraph's interrupt() for human-in-the-loop.
"""
from __future__ import annotations

from langgraph.types import interrupt, Command
from langgraph.graph import END

from src.state import CompanyResearchState


def human_review_node(state: CompanyResearchState) -> Command:
    user_decision: dict = interrupt({
        "question": (
            "Please review the generated report and decide if you want to "
            "accept it or make edits by providing a short prompt."
        )
    })

    if not user_decision.get("userAction"):
        raise ValueError("No user action or user edit prompt provided")

    user_action: str = user_decision["userAction"]

    if user_action not in ("accept", "edit"):
        raise ValueError('Invalid user action. Must be "accept" or "edit".')

    if user_action == "edit":
        user_prompt = user_decision.get("userPrompt")
        if not user_prompt or not isinstance(user_prompt, str):
            raise ValueError("Invalid user edit prompt. Must be a non-empty string.")
        return Command(goto="generate_report", update={"userPrompt": user_prompt})

    return Command(goto=END)
