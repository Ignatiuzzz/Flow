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
    return <p className="document-list__message">Cargando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <p className="document-list__message">
        Todavía no hay documentos subidos para este proyecto.
      </p>
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