# ai/rag/vector_store.py
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import os

class VectorStore:
    def __init__(self, persist_directory: Optional[str] = None, collection_name: str = "slides"):
        persist_directory = persist_directory or os.getenv("CHROMA_DB_DIR", "./storage/chroma_db")
        self.client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=persist_directory))
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def add_documents(self, ids: List[str], texts: List[str], embeddings: List[List[float]], metadatas: List[Dict]):
        """
        ids: list of doc ids (unique)
        texts: original chunk texts
        embeddings: list of vector lists
        metadatas: list of metadata dicts per chunk (e.g., {"document_id":..., "page":..})
        """
        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        # optionally persist (chroma does on shutdown, but safe to call)
        self.client.persist()

    def similarity_search(self, query_embedding: List[float], n_results: int = 5):
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        # results is a dict; we return first query's results
        if not results or "documents" not in results:
            return []
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]
        out = []
        for doc, meta, dist in zip(docs, metas, distances):
            out.append({"text": doc, "metadata": meta, "distance": dist})
        return out
