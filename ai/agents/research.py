def research_slide(slide_title: str):
    """
    Returns additional points/facts for a slide.
    Replace mock with HF API or web search later.
    """
    facts = {
        "Introduction": ["AI adoption increased by 60% in 2024", "Global impact on education is huge"],
        "Concept": ["Example concept fact 1", "Example concept fact 2"],
        "Summary": ["Key takeaway 1", "Key takeaway 2"]
    }
    key = "Introduction" if "Intro" in slide_title else "Concept" if "Concept" in slide_title else "Summary"
    return facts.get(key, [])
