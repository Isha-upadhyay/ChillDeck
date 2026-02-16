# ai/rag/rag_pipeline.py
from ai.rag.chunker import Chunker
from typing import List, Dict, Any

# Lazy globals
_embeddings_client = None
_vector_store = None
_retriever = None

def get_embeddings_client():
    global _embeddings_client
    if _embeddings_client is None:
        from ai.llms.embeddings_client import EmbeddingsClient
        _embeddings_client = EmbeddingsClient()
    return _embeddings_client

def get_vector_store(persist_dir=None):
    global _vector_store
    if _vector_store is None:
        from ai.rag.vector_store import VectorStore
        _vector_store = VectorStore(persist_directory=persist_dir)
    return _vector_store

def get_retriever():
    global _retriever
    if _retriever is None:
        from ai.rag.retriever import Retriever
        _retriever = Retriever(
            vs=get_vector_store(),
            embed_client=get_embeddings_client()
        )
    return _retriever


class RAGPipeline:
    def __init__(self, persist_dir: str = None):
        self.chunker = Chunker()
        self.persist_dir = persist_dir

    def ingest_document(self, document_id: str, text: str, metadata: Dict = None):
        metadata = metadata or {}
        chunks = self.chunker.chunk_text(text)
        if not chunks:
            return []

        embed_client = get_embeddings_client()
        vector_store = get_vector_store(self.persist_dir)

        BATCH_SIZE = 40
        all_ids = []

        for start in range(0, len(chunks), BATCH_SIZE):
            end = min(start + BATCH_SIZE, len(chunks))
            batch = chunks[start:end]

            embeddings = embed_client.embed_texts(batch)

            ids = []
            metas = []
            for i in range(start, end):
                cid = f"{document_id}__chunk__{i}"
                ids.append(cid)
                meta = {"document_id": document_id, "chunk_index": i}
                meta.update(metadata)
                metas.append(meta)

            vector_store.add_documents(
                ids=ids,
                texts=batch,
                embeddings=embeddings,
                metadatas=metas
            )

            all_ids.extend(ids)

        return all_ids

    def retrieve_for_topic(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        retriever = get_retriever()
        return retriever.retrieve(query, top_k=top_k)

    def retrieve_for_document(self, document_id: str, query: str, top_k: int = 5):
        retriever = get_retriever()
        return retriever.retrieve_by_document(document_id=document_id, query=query, top_k=top_k)

    def delete_document(self, document_id: str) -> bool:
        try:
            vs = get_vector_store(self.persist_dir)
            col = vs.get_collection()

            results = col.get(where={"document_id": document_id})
            if results and "ids" in results:
                col.delete(ids=results["ids"])
                return True
            return False
        except:
            return False

    def list_documents(self):
        try:
            vs = get_vector_store(self.persist_dir)
            col = vs.get_collection()

            results = col.get()
            if not results or not results.get("metadatas"):
                return []

            docs = set()
            for meta in results["metadatas"]:
                if isinstance(meta, dict) and "document_id" in meta:
                    docs.add(meta["document_id"])

            return [{"document_id": d} for d in docs]
        except:
            return []
