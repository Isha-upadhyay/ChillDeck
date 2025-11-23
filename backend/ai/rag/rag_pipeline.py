# ai/rag/rag_pipeline.py
from ai.rag.chunker import Chunker
from ai.llms.embeddings_client import EmbeddingsClient
from ai.rag.vector_store import VectorStore
from ai.rag.retriever import Retriever
from typing import List, Dict, Any
import uuid

class RAGPipeline:
    def __init__(self, persist_dir: str = None):
        self.chunker = Chunker()
        self.embed_client = EmbeddingsClient()
        self.vs = VectorStore(persist_directory=persist_dir)
        self.retriever = Retriever(self.vs, self.embed_client)

    def ingest_document(self, document_id: str, text: str, metadata: Dict = None):
        """
        - chunk text
        - embed chunks
        - add to vector store with metadata
        Returns list of chunk ids
        """
        metadata = metadata or {}
        chunks = self.chunker.chunk_text(text)
        if not chunks:
            return []

        embeddings = self.embed_client.embed_texts(chunks)
        ids = []
        metadatas = []
        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}__chunk__{i}"
            ids.append(chunk_id)
            # store metadata per chunk
            meta = {"document_id": document_id, "chunk_index": i}
            meta.update(metadata)
            metadatas.append(meta)

        # upsert into vector store
        self.vs.add_documents(ids=ids, texts=chunks, embeddings=embeddings, metadatas=metadatas)
        return ids

    def retrieve_for_topic(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Returns top_k relevant chunks for the given query
        """
        return self.retriever.retrieve(query, top_k=top_k)

    def retrieve_for_document(self, document_id: str, query: str, top_k: int = 5):
        return self.retriever.retrieve_by_document(document_id=document_id, query=query, top_k=top_k)
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete all chunks for a document from vector store.
        """
        try:
            # Get all chunks for this document
            results = self.vs.collection.get(
                where={"document_id": document_id}
            )
            if results and results.get("ids"):
                # Delete all chunks
                self.vs.collection.delete(ids=results["ids"])
                return True
            return False
        except Exception:
            return False
    
    def list_documents(self) -> List[Dict]:
        """
        List all unique document IDs in the vector store.
        """
        try:
            # Get all metadata
            results = self.vs.collection.get()
            if not results or not results.get("metadatas"):
                return []
            
            # Extract unique document IDs
            doc_ids = set()
            for meta in results["metadatas"]:
                if isinstance(meta, dict) and "document_id" in meta:
                    doc_ids.add(meta["document_id"])
            
            return [{"document_id": doc_id} for doc_id in doc_ids]
        except Exception:
            return []