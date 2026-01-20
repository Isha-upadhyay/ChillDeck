from sqlmodel import Session, select
from app.db.session import engine
from app.db.models import TemplateTable

TEMPLATES = [
    {
        "title": "Startup Pitch Deck",
        "category": "pitch",
        "description": "Problem → Solution → Traction → Ask",
        "structure": {
            "slides": [
                {"type": "title", "title": "Startup Pitch"},
                {"type": "problem"},
                {"type": "solution"},
                {"type": "market"},
                {"type": "traction"},
                {"type": "ask"}
            ]
        }
    },
    {
        "title": "Project Kickoff",
        "category": "project",
        "description": "Align teams before execution",
        "structure": {
            "slides": [
                {"type": "title"},
                {"type": "agenda"},
                {"type": "goals"},
                {"type": "timeline"},
                {"type": "owners"}
            ]
        }
    }
]


def seed():
    with Session(engine) as session:
        for t in TEMPLATES:
            exists = session.exec(
                select(TemplateTable)
                .where(TemplateTable.title == t["title"])
                .where(TemplateTable.category == t["category"])
            ).first()

            if exists:
                continue

            session.add(TemplateTable(**t))

        session.commit()


    print("✅ Templates seeded successfully")


if __name__ == "__main__":
    seed()
