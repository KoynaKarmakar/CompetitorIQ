"""
Firecrawl client — mirrors src/clients/fireCrawlApi.ts.
"""
import os
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

load_dotenv()

_api_key = os.getenv("FIRECRAWL_API_KEY", "").strip()
if not _api_key:
    raise EnvironmentError("FIRECRAWL_API_KEY is not set")

firecrawl_client = FirecrawlApp(api_key=_api_key)
