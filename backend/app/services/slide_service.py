# app/services/slide_service.py

from typing import List
from ai.agents.planner import PlannerAgent
from ai.agents.research import ResearcherAgent
from ai.agents.writer import WriterAgent
from ai.agents.slide_designer import DesignerAgent
from ai.agents.image_generator import ImageAgent
from ai.agents.quality import QualityAgent
from ai.agents.orchestrator import SlideOrchestrator


class SlideService:
    """
    Central service that controls the slide generation pipeline.
    """

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.writer = WriterAgent()
        self.designer = DesignerAgent()
        self.image_gen = ImageAgent()
        self.quality = QualityAgent()
        self.orchestrator = SlideOrchestrator()

    # --------------------------
    # MAIN PIPELINE
    # --------------------------
    def generate_slides(self, topic: str, style: str = "corporate", detail: str = "medium"):
        """
        Full multi-agent slide generation workflow.
        Uses the orchestrator for complete slide generation.
        """
        return self.orchestrator.generate_presentation(topic, style, detail)

    # --------------------------
    # ORCHESTRATOR (recommended)
    # --------------------------
    def generate_with_orchestrator(self, topic: str, style: str = "corporate", detail: str = "medium"):
        """
        Uses a single Orchestrator agent to auto decide:
        - slide count
        - styles
        - research depth
        """
        return self.orchestrator.generate_presentation(topic, style, detail)
