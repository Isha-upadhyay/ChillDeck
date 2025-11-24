# ai/rag/chunker.py
from typing import List
import re

class Chunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100, max_text_length: int = 500000):
        """
        chunk_size: approx number of words per chunk
        chunk_overlap: number of overlapping words between chunks
        max_text_length: maximum characters to process (to prevent memory issues)
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.max_text_length = max_text_length

    def chunk_text(self, text: str) -> List[str]:
        """
        Memory-efficient chunking that processes text in smaller batches
        """
        if not text or not text.strip():
            return []
        
        # Limit text length to prevent memory issues
        if len(text) > self.max_text_length:
            text = text[:self.max_text_length]
            # Try to cut at a sentence boundary
            last_period = text.rfind('.')
            last_newline = text.rfind('\n')
            cut_point = max(last_period, last_newline)
            if cut_point > self.max_text_length * 0.9:  # Only if we find a good break point
                text = text[:cut_point + 1]
        
        # Use regex to split on whitespace more efficiently
        # This is more memory-efficient than split() for very large texts
        words = re.findall(r'\S+', text)
        
        if not words:
            return []

        # Process in batches to avoid memory issues
        chunks = []
        start = 0
        n = len(words)
        
        # Limit total chunks to prevent memory issues
        max_chunks = 1000
        chunk_count = 0

        while start < n and chunk_count < max_chunks:
            end = min(start + self.chunk_size, n)
            # Use join on slice directly - more memory efficient
            chunk = " ".join(words[start:end]).strip()
            if chunk:  # Only add non-empty chunks
                chunks.append(chunk)
                chunk_count += 1
            # advance with overlap
            start = end - self.chunk_overlap
            if start < 0:
                start = 0
            if start >= n:
                break

        return chunks
