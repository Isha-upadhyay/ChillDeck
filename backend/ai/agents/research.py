from ai.utils.agents_utils import BaseAgent
import requests
import os

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

RESEARCHER_SYSTEM_PROMPT = """
You are a Research Agent.
You take slide outline and perform research.
Use facts, statistics, recent data.
Return JSON:

{
  "research": [
     {
       "slide_id": 1,
       "data": [
          "Fact 1",
          "Stat 2"
       ]
     }
  ]
}
"""

class ResearcherAgent(BaseAgent):
    def __init__(self):
        super().__init__(RESEARCHER_SYSTEM_PROMPT)

    def web_search(self, query):
        url = "https://api.tavily.com/search"
        payload = {"api_key": TAVILY_API_KEY, "query": query}
        res = requests.post(url, json=payload).json()
        return res.get("results", [])

    def research(self, topic: str = None, subtopics: list = None, outline_json: str = None):
        """Perform research for a topic/subtopics or outline"""
        if outline_json:
            prompt = f"Perform research for: {outline_json}\nUse structured facts."
        else:
            query = topic or ""
            if subtopics:
                query += f" - {', '.join(subtopics)}"
            
            # Try web search first if API key available
            search_results = []
            if TAVILY_API_KEY:
                try:
                    search_results = self.web_search(query)
                except (requests.RequestException, ValueError, KeyError):
                    pass
            
            # Combine search results with LLM research
            context = "\n".join([r.get("content", "") for r in search_results[:3]]) if search_results else ""
            prompt = f"Topic: {query}\n\nSearch Results:\n{context}\n\nExtract key facts, statistics, and insights. Return structured research data."
        
        result = self.run(prompt)
        import json
        try:
            return json.loads(result)
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"research": [], "facts": [], "statistics": []}
