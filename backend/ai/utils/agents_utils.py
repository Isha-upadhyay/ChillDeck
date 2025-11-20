from ai.llms.groq_client import GroqLLM

class BaseAgent:
    def __init__(self, system_prompt: str):
        self.llm = GroqLLM()
        self.system_prompt = system_prompt

    def run(self, user_prompt: str):
        prompt = f"""
        You are an autonomous AI agent.

        {self.system_prompt}

        USER REQUEST:
        {user_prompt}

        Return STRICTLY in valid JSON only.
        """

        return self.llm.generate(prompt)
