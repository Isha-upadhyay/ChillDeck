# app/utils/utils.py
import re
import unicodedata
from pathlib import Path

def slugify(value: str, allow_unicode: bool = False) -> str:
    """
    Simplified slugify; used for filenames or friendly ids.
    """
    if allow_unicode:
        value = unicodedata.normalize("NFKC", value)
    else:
        value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    return re.sub(r"[-\s]+", "-", value)

def safe_filename(filename: str) -> str:
    """
    Make filename safe by removing suspicious characters.
    """
    return slugify(Path(filename).stem) + Path(filename).suffix

