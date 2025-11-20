from ai.utils.agent_utils import BaseAgent
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

    def research(self, outline_json: str):
        prompt = f"Perform research for: {outline_json}\nUse structured facts."
        return self.run(prompt)
