import { AuditDocument } from "../../types/document";
import DocumentCard from "./DocumentCard";
import "../../styles/components/documents/DocumentList.css";

interface DocumentListProps {
  documents: AuditDocument[];
  loading: boolean;
  onDelete: (documentId: string) => void;
}

function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  if (loading) {
    return (
      <div className="document-list__state">
        <div className="document-list__loader" />
        <p>Cargando documentos...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="document-list__state">
        <h3>No hay documentos todavía</h3>
        <p>
          Sube el primer documento del proyecto para iniciar el trabajo de
          revisión documental.
        </p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DocumentList;