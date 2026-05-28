import { AuditDocument } from "../../types/document";
import DocumentCard from "./DocumentCard";
import "../../styles/components/documents/DocumentList.css";

interface DocumentListProps {
  documents: AuditDocument[];
  loading: boolean;
  onOpen: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

function DocumentList({
  documents,
  loading,
  onOpen,
  onDelete,
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="document-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <div className="document-list__loader mb-4 h-10 w-10 animate-spin rounded-full border-4" />
        <p>Cargando documentos...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="document-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <h3>No hay documentos todavía</h3>
        <p>
          Sube el primer documento del proyecto para iniciar el trabajo de
          revisión documental.
        </p>
      </div>
    );
  }

  return (
    <div className="document-list flex flex-col gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DocumentList;