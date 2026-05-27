import { documentApi } from "../../api/documentApi";
import { AuditDocument } from "../../types/document";
import "../../styles/components/documents/DocumentCard.css";

interface DocumentCardProps {
  document: AuditDocument;
  onOpen: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

function DocumentCard({ document, onOpen, onDelete }: DocumentCardProps) {
  const fileUrl = documentApi.fileUrl(document.id);

  const sizeInMb = document.tamanioBytes
    ? (document.tamanioBytes / (1024 * 1024)).toFixed(2)
    : null;

  return (
    <article className="document-card">
      <div className="document-card__main">
        <div className="document-card__top">
          <span className="document-card__type">
            {document.tipoArchivo.toUpperCase()}
          </span>
        </div>

        <h3>{document.nombreOriginal}</h3>

        <div className="document-card__meta">
          <span>Extensión: {document.extension}</span>
          {sizeInMb && <span>Tamaño: {sizeInMb} MB</span>}
        </div>
      </div>

      <div className="document-card__actions">
        <button type="button" onClick={() => onOpen(document.id)}>
          Abrir
        </button>

        <a href={fileUrl} download>
          Descargar
        </a>

        <button
          type="button"
          className="document-card__delete"
          onClick={() => onDelete(document.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default DocumentCard;