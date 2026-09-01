import os

from tavily import TavilyClient
from .config import settings


api_key = settings.tavily_api_key

if not api_key:
    raise RuntimeError(
        "TAVILY_API_KEY is not configured"
    )


tavily_client = TavilyClient(
    api_key=api_key
)


def search_web(
    question: str,
    max_results: int = 5
):

    response = tavily_client.search(
        query=question,
        search_depth="basic",
        max_results=max_results
    )

    return response.get("results", [])