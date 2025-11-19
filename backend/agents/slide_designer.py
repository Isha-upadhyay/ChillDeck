def apply_theme(slide, theme="corporate"):
    icons = {"corporate":"💼","tech":"💻","cute":"🐱"}
    icon = icons.get(theme,"📄")
    slide["title"] = f"{icon} {slide['title']}"
    return slide
