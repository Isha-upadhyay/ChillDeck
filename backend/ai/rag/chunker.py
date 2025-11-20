# ai/rag/chunker.py
from typing import List

class Chunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        """
        chunk_size: approx number of words per chunk
        chunk_overlap: number of overlapping words between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str) -> List[str]:
        words = text.split()
        if not words:
            return []

        chunks = []
        start = 0
        n = len(words)

        while start < n:
            end = min(start + self.chunk_size, n)
            chunk = " ".join(words[start:end]).strip()
            chunks.append(chunk)
            # advance with overlap
            start = end - self.chunk_overlap
            if start < 0:
                start = 0
            if start >= n:
                break

        return chunks
