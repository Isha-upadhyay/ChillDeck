# app/services/slide_service.py

from typing import List
from ai.agents.planner import PlannerAgent
from ai.agents.research import ResearchAgent
from ai.agents.writer import WriterAgent
from ai.agents.slide_designer import SlideDesignerAgent
from ai.agents.image_generator import ImageGeneratorAgent
from ai.agents.quality import QualityAgent
from ai.agents.orchestrator import OrchestratorAgent


class SlideService:
    """
    Central service that controls the slide generation pipeline.
    """

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearchAgent()
        self.writer = WriterAgent()
        self.designer = SlideDesignerAgent()
        self.image_gen = ImageGeneratorAgent()
        self.quality = QualityAgent()
        self.orchestrator = OrchestratorAgent()

    # --------------------------
    # MAIN PIPELINE
    # --------------------------
    async def generate_slides(self, topic: str, slide_count: int):
        """
        Full multi-agent slide generation workflow.
        """

        # 1) Plan structure
        outline = await self.planner.create_outline(topic, slide_count)

        # 2) Research each point
        research_data = await self.researcher.fetch_research(outline)

        # 3) Write content
        slides = await self.writer.write_slides(research_data)

        # 4) Generate images
        images = await self.image_gen.generate_images(slides)

        # 5) Full slide layout (title, body, bullets, image)
        designed_slides = self.designer.build_layout(slides, images)

        # 6) Quality check
        final_slides = await self.quality.validate(designed_slides)

        return final_slides

    # --------------------------
    # ORCHESTRATOR (optional)
    # --------------------------
    async def generate_with_orchestrator(self, topic: str):
        """
        Uses a single Orchestrator agent to auto decide:
        - slide count
        - styles
        - research depth
        """

        return await self.orchestrator.run(topic)
