from tavily import TavilyClient
import os

def get_tavily_client():
    return TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
