# app/services/rag_service.py

from uuid import uuid4
from typing import Dict, Any, List, Optional
from ai.rag.rag_pipeline import RAGPipeline
from app.core.logger import logger


class RAGService:
    """
    High-level service for:
    - ingesting documents into vector DB
    - running global/document queries
    - retrieving contextual chunks
    """

    def __init__(self, persist_dir: Optional[str] = None):
        try:
            self.pipeline = RAGPipeline(persist_dir=persist_dir)
            logger.info("RAGPipeline initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAGPipeline: {e}")
            raise

    # ---------------------------------------
    # INGEST FILE / TEXT
    # ---------------------------------------
    def ingest_file_text(
        self, 
        filename: str, 
        text: str, 
        extra_meta: Dict = None
    ) -> Dict[str, Any]:
        
        if not text or len(text.strip()) == 0:
            raise ValueError("Cannot ingest empty text")

        doc_id = f"doc__{uuid4().hex[:12]}"
        metadata = {"filename": filename}

        if extra_meta:
            metadata.update(extra_meta)

        logger.info(f"[RAG] Ingesting document: {filename} ({doc_id}), text length: {len(text)}")

        try:
            # Process in batches to avoid memory issues
            chunk_ids = self.pipeline.ingest_document(
                document_id=doc_id,
                text=text,
                metadata=metadata
            )
        except MemoryError as e:
            logger.error(f"[RAG] Memory error ingesting {filename}: {e}")
            raise ValueError(f"Document too large to process. Please use a smaller file or split the document.")
        except Exception as e:
            logger.error(f"[RAG] Ingestion failed for {filename}: {e}", exc_info=True)
            raise

        logger.info(f"[RAG] Document {doc_id} ingested with {len(chunk_ids)} chunks")

        return {
            "document_id": doc_id,
            "chunks_added": len(chunk_ids),
            "metadata": metadata
        }

    # ---------------------------------------
    # GLOBAL QUERY
    # ---------------------------------------
    def query_global(
        self, 
        query: str, 
        top_k: int = 5
    ) -> List[Dict]:

        logger.info(f"[RAG] Global query: '{query}' (top_k={top_k})")

        try:
            return self.pipeline.retrieve_for_topic(query, top_k=top_k)
        except Exception as e:
            logger.error(f"[RAG] Error in global query: {e}")
            raise

    # ---------------------------------------
    # DOCUMENT-SPECIFIC QUERY
    # ---------------------------------------
    def query_document(
        self, 
        document_id: str, 
        query: str, 
        top_k: int = 5
    ) -> List[Dict]:

        logger.info(f"[RAG] Querying document: {document_id} | query='{query}'")

        try:
            return self.pipeline.retrieve_for_document(
                document_id=document_id,
                query=query,
                top_k=top_k
            )
        except Exception as e:
            logger.error(f"[RAG] Error querying document {document_id}: {e}")
            raise

    # ---------------------------------------
    # DELETE DOCUMENT
    # ---------------------------------------
    def delete_document(self, document_id: str) -> bool:
        """
        Remove a document + its chunks from vector DB.
        """
        logger.info(f"[RAG] Deleting document: {document_id}")

        try:
            return self.pipeline.delete_document(document_id)
        except Exception as e:
            logger.error(f"[RAG] Error deleting document {document_id}: {e}")
            raise

    # ---------------------------------------
    # LIST ALL DOCUMENTS
    # ---------------------------------------
    def list_documents(self) -> List[Dict]:
        """
        Return a list of all indexed documents (if supported by pipeline).
        """
        try:
            return self.pipeline.list_documents()
        except Exception as e:
            logger.error(f"[RAG] Error listing documents: {e}")
            raise
