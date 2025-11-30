# import uuid
# from ai.agents.planner import PlannerAgent
# from ai.agents.research import ResearcherAgent
# from ai.agents.writer import WriterAgent
# from ai.agents.slide_designer import DesignerAgent
# from ai.agents.image_generator import ImageAgent
# from app.services.rag_services import RAGService


# class SlideOrchestrator:
#     def __init__(self):
#         self.rag = RAGService() 
#         self.planner = PlannerAgent()
#         self.researcher = ResearcherAgent()
#         self.writer = WriterAgent()
#         self.designer = DesignerAgent()
#         self.image = ImageAgent()

#     def generate_presentation(self, topic, style="corporate", detail="medium"):
#         # 1) PLAN STRUCTURE
#         outline = self.planner.create_outline(topic, detail)

#         slides_output = []

#         for slide in outline["slides"]:
#             title = slide["title"]
#             subtopics = slide.get("points", [])

#             # 2) DO RESEARCH
#             research_data = self.researcher.research(topic=title, subtopics=subtopics)

#             # 3) WRITE SLIDE CONTENT
#             content = self.writer.write_slide(title, research_data)

#             # 4) DESIGN (theme + layout)
#             design = self.designer.apply_design(content, style)

#             # 5) IMAGE GENERATION PROMPT
#             image_prompt = self.designer.generate_image_prompt(content)

#             # 6) IMAGE GENERATION
#             image_data = self.image.generate_image(image_prompt)

#             # 7) FINAL SLIDE JSON PACKAGE
#             slide_json = {
#                 "id": str(uuid.uuid4()),
#                 "title": content["title"],
#                 "bullets": content["bullets"],
#                 "notes": content.get("notes", ""),
#                 "design": design,
#                 "image": image_data,
#             }

#             slides_output.append(slide_json)

#         return {
#             "topic": topic,
#             "style": style,
#             "slides": slides_output,
#             "total_slides": len(slides_output)
#         }


import uuid
from ai.agents.planner import PlannerAgent
from ai.agents.research import ResearcherAgent
from ai.agents.writer import WriterAgent
from ai.agents.slide_designer import DesignerAgent
from ai.agents.image_generator import ImageAgent
from app.services.rag_services import RAGService


class SlideOrchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.writer = WriterAgent()
        self.designer = DesignerAgent()
        self.image = ImageAgent()
        self.rag = RAGService()

    def safe_list(self, value):
        if not value:
            return []
        if not isinstance(value, list):
            return [value]
        return [v for v in value if v is not None]

    def safe_text(self, value):
        if value is None:
            return ""
        if isinstance(value, (dict, list)):
            return str(value)
        return str(value)

    def generate_presentation(self, topic, document_id=None, style="corporate", detail="medium"):

        # -----------------------------
        # 1) SAFE OUTLINE GENERATION
        # -----------------------------
        try:
            if document_id:
                doc_hits = self.rag.query_document(document_id, topic, top_k=8)
                doc_texts = [h.get("text", "") for h in doc_hits if h]
                context_doc = "\n\n".join(doc_texts)

                outline = self.planner.plan_from_document(
                    context=context_doc,
                    detail=detail,
                    num_slides=10
                )
            else:
                outline = self.planner.plan(topic, detail, 10)

        except Exception:
            outline = {"slides": []}

        # Hard fallback
        slides_list = outline.get("slides") if isinstance(outline, dict) else None
        if not slides_list:
            slides_list = [
                {"title": f"{topic} - Introduction", "points": ["Overview"]},
                {"title": f"{topic} - Concepts", "points": ["Concept 1", "Concept 2"]},
                {"title": f"{topic} - Summary", "points": ["Takeaways"]},
            ]

        slides_output = []

        # -----------------------------
        # 2) PROCESS EACH SLIDE SAFELY
        # -----------------------------
        for raw_slide in slides_list:
            if not isinstance(raw_slide, dict):
                continue

            title = raw_slide.get("title") or "Untitled Slide"
            subtopics = self.safe_list(raw_slide.get("points"))

            # -------- RAG SAFE --------
            rag_hits = self.rag.query_global(title, top_k=5)
            rag_context = "\n\n".join([h.get("text", "") for h in rag_hits if h])

            # -------- Research SAFE --------
            agent_research = self.safe_text(self.researcher.research(title, subtopics))

            final_context = rag_context + "\n\n" + agent_research

            # -------- Writer SAFE --------
            raw_content = self.writer.write_slide(title, final_context)
            if not isinstance(raw_content, dict):
                raw_content = {"title": title, "bullets": subtopics, "notes": ""}

            content = {
                "title": raw_content.get("title", title),
                "bullets": self.safe_list(raw_content.get("bullets")),
                "notes": self.safe_text(raw_content.get("notes")),
            }

            # -------- Designer SAFE --------
            design = self.designer.apply_design(content, style)
            if not isinstance(design, dict):
                design = {"layout": "title_and_body", "theme": style}

            # -------- Image SAFE --------
            img_prompt = self.designer.generate_image_prompt(content)
            image_data = self.image.generate_image(img_prompt)

            slides_output.append({
                "id": str(uuid.uuid4()),
                "title": content["title"],
                "bullets": content["bullets"],
                "notes": content["notes"],
                "design": design,
                "image": image_data
            })

        return {
            "topic": topic,
            "style": style,
            "slides": slides_output,
            "total_slides": len(slides_output)
        }
