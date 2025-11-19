def improve_slide(slide):
    """
    slide = {"title":..., "points":[...]}
    """
    # Remove duplicates
    slide["points"] = list(dict.fromkeys(slide["points"]))
    
    # Optional: grammar correction via API or Python library
    slide["points"] = [p.replace("dyamically", "dynamically") for p in slide["points"]]
    
    return slide
