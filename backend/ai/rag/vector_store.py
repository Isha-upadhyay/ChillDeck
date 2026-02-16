# ai/rag/vector_store.py
import os
from pathlib import Path
from typing import List, Dict, Optional

class VectorStore:
    def __init__(self, persist_directory: Optional[str] = None, collection_name: str = "slides"):
        self.persist_directory = persist_directory or os.getenv("CHROMA_DB_DIR", "./vector_store")
        Path(self.persist_directory).mkdir(parents=True, exist_ok=True)

        self.collection_name = collection_name
        self.client = None
        self.collection = None

    def get_collection(self):
        if self.client is None:
            import chromadb
            try:
                self.client = chromadb.PersistentClient(path=self.persist_directory)
            except:
                from chromadb.config import Settings
                self.client = chromadb.Client(Settings(
                    chroma_db_impl="duckdb+parquet",
                    persist_directory=self.persist_directory
                ))

            self.collection = self.client.get_or_create_collection(name=self.collection_name)
        return self.collection

    def add_documents(self, ids: List[str], texts: List[str], embeddings: List[List[float]], metadatas: List[Dict]):
        col = self.get_collection()
        try:
            col.add(
                ids=ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas
            )
        except:
            col.upsert(
                ids=ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas
            )

        if hasattr(self.client, "persist"):
            try:
                self.client.persist()
            except:
                pass

    def similarity_search(self, query_embedding: List[float], n_results: int = 5):
        col = self.get_collection()
        results = col.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        if not results or "documents" not in results:
            return []

        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]

        out = []
        for doc, meta, dist in zip(docs, metas, distances):
            out.append({"text": doc, "metadata": meta, "distance": dist})
        return out
