# # ai/rag/retriever.py
# from ai.llms.embeddings_client import EmbeddingsClient
# from ai.rag.vector_store import VectorStore
# from typing import List, Dict, Any

# class Retriever:
#     def __init__(self, vs: VectorStore = None, embed_client: EmbeddingsClient = None):
#         self.vs = vs or VectorStore()
#         self.embed = embed_client or EmbeddingsClient()

#     def retrieve(self, query: str, top_k: int = 5):
#         q_vec = self.embed.embed_text(query)
#         hits = self.vs.similarity_search(q_vec, n_results=top_k)
#         # return ranked list
#         return hits

#     def retrieve_by_document(self, document_id: str, query: str, top_k: int = 5):
#         # optionally filter by metadata
#         q_vec = self.embed.embed_text(query)
#         results = self.vs.collection.query(
#             query_embeddings=[q_vec],
#             n_results=top_k,
#             where={"document_id": document_id},
#             include=["documents", "metadatas", "distances"]
#         )
#         docs = results["documents"][0]
#         metas = results["metadatas"][0]
#         distances = results["distances"][0]
#         return [{"text": d, "metadata": m, "distance": dist} for d,m,dist in zip(docs, metas, distances)]




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
