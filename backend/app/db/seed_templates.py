from sqlmodel import Session
from app.db.session import engine
from app.db.models import TemplateTable

TEMPLATES = [
    {
        "title": "Startup Pitch Deck",
        "category": "pitch",
        "description": "Perfect for early-stage startups",
        "structure": {
            "slides": [
                {"type": "title", "title": "Startup Pitch"},
                {"type": "problem", "title": "Problem"},
                {"type": "solution", "title": "Solution"},
                {"type": "market", "title": "Market Opportunity"},
                {"type": "traction", "title": "Traction"},
                {"type": "ask", "title": "The Ask"}
            ]
        }
    },
    {
        "title": "Project Kickoff",
        "category": "project",
        "description": "Align teams before starting",
        "structure": {
            "slides": [
                {"type": "title", "title": "Project Kickoff"},
                {"type": "agenda", "title": "Agenda"},
                {"type": "goals", "title": "Goals"},
                {"type": "timeline", "title": "Timeline"},
                {"type": "roles", "title": "Roles & Owners"}
            ]
        }
    }
]

def seed():
    with Session(engine) as session:
        for t in TEMPLATES:
            session.add(TemplateTable(**t))
        session.commit()
print("Templates seeded successfully")
