# ai/rag/retriever.py
from typing import List, Dict, Any

class Retriever:
    def __init__(self, vs=None, embed_client=None):
        self.vs = vs
        self.embed = embed_client

    def retrieve(self, query: str, top_k: int = 5):
        q_vec = self.embed.embed_text(query)
        return self.vs.similarity_search(q_vec, n_results=top_k)

    def retrieve_by_document(self, document_id: str, query: str, top_k: int = 5):
        q_vec = self.embed.embed_text(query)

        col = self.vs.get_collection()
        results = col.query(
            query_embeddings=[q_vec],
            n_results=top_k,
            where={"document_id": document_id},
            include=["documents", "metadatas", "distances"]
        )

        docs = results["documents"][0]
        metas = results["metadatas"][0]
        dists = results["distances"][0]

        return [
            {"text": d, "metadata": m, "distance": dist}
            for d, m, dist in zip(docs, metas, dists)
        ]
