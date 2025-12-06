# # ai/rag/embeddings_client.py
# from sentence_transformers import SentenceTransformer
# import numpy as np
# from typing import List

# class EmbeddingsClient:
#     def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
#         # small & fast, good for retrieval
#         self.model = SentenceTransformer(model_name)

#     def embed_texts(self, texts: List[str]) -> List[List[float]]:
#         """
#         Returns list of vectors (as lists) for the provided texts.
#         """
#         if not texts:
#             return []
#         vectors = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
#         # ensure python lists for storage
#         return [vec.tolist() for vec in vectors]

#     def embed_text(self, text: str) -> List[float]:
#         return self.embed_texts([text])[0]




# ai/rag/embeddings_client.py
import numpy as np
from typing import List

class EmbeddingsClient:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None   # Lazy load

    def get_model(self):
        if self.model is None:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
        return self.model

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        model = self.get_model()
        vectors = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return [vec.tolist() for vec in vectors]

    def embed_text(self, text: str) -> List[float]:
        return self.embed_texts([text])[0]
