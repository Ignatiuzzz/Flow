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
    <article className="document-card flex flex-col gap-4 rounded-3xl border bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.01] animate-fade-in-up [&_h3]:mb-2 [&_h3]:break-words [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-950 [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-slate-500">
      <div className="document-card__icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-sm">
        {document.tipoArchivo.toUpperCase()}
      </div>

      <div className="document-card__main min-w-0 flex-1">
        <div className="document-card__top mb-2 flex flex-wrap items-center gap-2">
          <span className="document-card__type rounded-full border px-3 py-1 text-xs font-bold uppercase">
            {document.tipoArchivo.toUpperCase()}
          </span>

          {sizeInMb && <span className="document-card__size rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{sizeInMb} MB</span>}
        </div>

        <h3>{document.nombreOriginal}</h3>

        <p>
          Archivo documental registrado en el proyecto para revisión y respaldo.
        </p>
      </div>

      <div className="document-card__actions flex flex-wrap gap-2 border-t border-slate-100 pt-4 xl:min-w-[220px] xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
        <button type="button" onClick={() => onOpen(document.id)}>
          Abrir
        </button>

        <a href={fileUrl} download>
          Descargar
        </a>

        <button
          type="button"
          className="document-card__delete text-red-700"
          onClick={() => onDelete(document.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default DocumentCard;