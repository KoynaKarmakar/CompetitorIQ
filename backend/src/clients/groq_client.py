"""
Groq LLM clients.

`groq_client`      — plain chat completion.
`groq_json_client` — same model with JSON mode enabled. Every node in this graph
                     expects a JSON object back, so JSON mode is what they should
                     use: it prevents ``` fences and prose preambles at the source
                     rather than relying on the parser to recover from them.
"""
import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY", "").strip()
if not _api_key:
    raise EnvironmentError("GROQ_API_KEY is not set")

MODEL = "llama-3.3-70b-versatile"

groq_client = ChatGroq(
    api_key=_api_key,
    model=MODEL,
    temperature=0.2,
)

# Groq requires the word "json" to appear in the prompt when this is set —
# every prompt in src/prompts.py says "Return ONLY a valid JSON object".
groq_json_client = groq_client.bind(response_format={"type": "json_object"})
