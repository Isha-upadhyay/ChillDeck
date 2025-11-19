def generate_outline(topic: str, detail: str = "medium"):
    """
    Returns dynamic slide outline based on topic.
    Each slide = title + points (placeholders)
    """
    slides = []
    
    # Decide number of slides based on detail
    num_slides = {"minimal":3, "medium":5, "detailed":8}.get(detail,5)
    
    # Slide 1: Introduction
    slides.append({"title": f"Introduction to {topic}", 
                   "points":["Definition", "Importance", "Key facts"]})
    
    # Middle slides: Concepts / Details
    for i in range(2, num_slides):
        slides.append({"title": f"{topic} Concept {i-1}", 
                       "points":[f"Point {i}-1", f"Point {i}-2", f"Point {i}-3"]})
    
    # Last slide: Summary
    slides.append({"title":"Summary", "points":["Key takeaways","Next steps"]})
    
    return slides
