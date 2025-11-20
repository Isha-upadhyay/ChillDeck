import uuid
from agents.planner import PlannerAgent
from agents.research import ResearcherAgent
from agents.writer import WriterAgent
from agents.slide_designer import DesignerAgent
from agents.image_generator import ImageAgent

class SlideOrchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.writer = WriterAgent()
        self.designer = DesignerAgent()
        self.image = ImageAgent()

    def generate_presentation(self, topic, style="corporate", detail="medium"):
        # 1) PLAN STRUCTURE
        outline = self.planner.create_outline(topic, detail)

        slides_output = []

        for slide in outline["slides"]:
            title = slide["title"]
            subtopics = slide.get("points", [])

            # 2) DO RESEARCH
            research_data = self.researcher.research(topic=title, subtopics=subtopics)

            # 3) WRITE SLIDE CONTENT
            content = self.writer.write_slide(title, research_data)

            # 4) DESIGN (theme + layout)
            design = self.designer.apply_design(content, style)

            # 5) IMAGE GENERATION PROMPT
            image_prompt = self.designer.generate_image_prompt(content)

            # 6) IMAGE GENERATION
            image_data = self.image.generate_image(image_prompt)

            # 7) FINAL SLIDE JSON PACKAGE
            slide_json = {
                "id": str(uuid.uuid4()),
                "title": content["title"],
                "bullets": content["bullets"],
                "notes": content.get("notes", ""),
                "design": design,
                "image": image_data,
            }

            slides_output.append(slide_json)

        return {
            "topic": topic,
            "style": style,
            "slides": slides_output,
            "total_slides": len(slides_output)
        }
