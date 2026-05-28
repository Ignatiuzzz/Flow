import os
import logging
import uuid
from typing import List, Optional
from pathlib import Path
import pypdf
from docx import Document as DocxDocument
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

logger = logging.getLogger(__name__)

CHROMA_PATH = os.path.join("app", "chroma_db")

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        if not input:
            return []
            
        from app.services.ai_service import _get_client
        client = _get_client()
        model = "gemini-embedding-2"
        embeddings_result = []
        batch_size = 20
        for i in range(0, len(input), batch_size):
            batch = input[i:i+batch_size]
            try:
                response = client.models.embed_content(
                    model=model,
                    contents=batch,
                )
                if not isinstance(response.embeddings, list):
                    embeddings_result.append(response.embeddings.values)
                else:
                    for emb in response.embeddings:
                        embeddings_result.append(emb.values)
                        
            except Exception as e:
                logger.error(f"Error generando embeddings: {e}")
                for _ in batch:
                    embeddings_result.append([0.0] * 768)
                    
        return embeddings_result

try:
    os.makedirs(CHROMA_PATH, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    gemini_ef = GeminiEmbeddingFunction()
    

    collection = chroma_client.get_or_create_collection(
        name="audit_documents",
        embedding_function=gemini_ef
    )
except Exception as e:
    logger.error(f"Error inicializando ChromaDB: {e}")
    collection = None


def extract_text(file_path: str, extension: str) -> str:
    text = ""
    try:
        if extension.lower() == ".pdf":
            with open(file_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        elif extension.lower() == ".docx":
            doc = DocxDocument(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error extrayendo texto de {file_path}: {e}")
        
    return text


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    if not text:
        return []
        
    text = " ".join(text.split())
    chunks = []
    
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
        
    return chunks


def index_document(file_path: str, project_id: str, document_id: str, document_name: str) -> bool:
    if not collection:
        logger.error("ChromaDB no está disponible. No se indexará.")
        return False
        
    try:
        path = Path(file_path)
        if not path.exists():
            logger.error(f"Archivo no encontrado: {file_path}")
            return False
            
        text = extract_text(file_path, path.suffix)
        if not text.strip():
            logger.warning(f"No se pudo extraer texto de: {file_path}")
            return False
            
        chunks = chunk_text(text)
        if not chunks:
            return False
            
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {"proyectoId": str(project_id), "documentoId": str(document_id), "nombre": document_name}
            for _ in chunks
        ]
        
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"Documento {document_id} indexado correctamente con {len(chunks)} fragmentos.")
        return True
    except Exception as e:
        logger.error(f"Error indexando documento {document_id}: {e}")
        return False


def delete_document_index(document_id: str) -> bool:
    if not collection:
        return False
        
    try:
        collection.delete(
            where={"documentoId": str(document_id)}
        )
        return True
    except Exception as e:
        logger.error(f"Error eliminando índice del documento {document_id}: {e}")
        return False


def search_relevant_chunks(query: str, project_id: str, top_k: int = 4) -> str:
    if not collection or not query.strip():
        return ""
        
    try:
        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            where={"proyectoId": str(project_id)}
        )
        
        if not results['documents'] or not results['documents'][0]:
            return ""
            
        context_parts = []
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            doc_name = meta.get("nombre", "Documento")
            context_parts.append(f"--- Del documento '{doc_name}' ---\n{doc}")
            
        return "\n\n".join(context_parts)
    except Exception as e:
        logger.error(f"Error buscando contexto relevante: {e}")
        return ""
