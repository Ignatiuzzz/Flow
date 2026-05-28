import toast from "react-hot-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import { highlightApi } from "../../api/highlightApi";
import { HighlightRelations } from "../../types/highlight";
import { Note } from "../../types/note";
import "../../styles/components/notes/NoteCard.css";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [relations, setRelations] = useState<HighlightRelations | null>(null);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [relationsLoaded, setRelationsLoaded] = useState(false);

  const showValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === "") {
      return "No registrado";
    }

    return value;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "No registrada";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const loadRelations = async () => {
    if (relationsLoaded) return;

    if (!note.subrayadoId) {
      setRelations(null);
      setRelationsLoaded(true);
      return;
    }

    try {
      setLoadingRelations(true);

      const response = await highlightApi.getRelations(note.subrayadoId);

      setRelations(response);
      setRelationsLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el subrayado relacionado a la nota.");
    } finally {
      setLoadingRelations(false);
    }
  };

  const handleToggleDetails = async () => {
    const nextExpandedState = !expanded;

    setExpanded(nextExpandedState);

    if (nextExpandedState) {
      await loadRelations();
    }
  };

  const relatedFindingLabel = relations?.hallazgo
    ? `${relations.hallazgo.codigo} - ${relations.hallazgo.nombre}`
    : note.hallazgoId
    ? "Hallazgo relacionado"
    : "No registrado";

  const relatedDocumentLabel = relations?.documento
    ? relations.documento.nombreOriginal
    : note.documentoId
    ? "Documento relacionado"
    : "No registrado";

  const relatedHighlightLabel = relations?.subrayado
    ? relations.subrayado.textoSubrayado
    : note.subrayadoId
    ? "Subrayado relacionado"
    : "No registrado";

  return (
    <article className={expanded ? "note-card note-card--expanded" : "note-card"}>
      <div className="note-card__main min-w-0 flex-1">
        <div className="note-card__top mb-3 flex flex-wrap gap-2">
          <span className="note-card__badge">
            {note.hallazgoId ? "Relacionada a hallazgo" : "Nota general"}
          </span>

          {note.documentoId && (
            <span className="note-card__document">Desde documento</span>
          )}

          {note.subrayadoId && (
            <span className="note-card__highlighted">Con subrayado</span>
          )}
        </div>

        <h3>{note.subtitulo || "Sin subtítulo"}</h3>

        <p>{note.texto}</p>
      </div>

      <div className="note-card__actions flex flex-wrap gap-2 border-t border-slate-100 pt-4 [&_button]:rounded-2xl [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-center [&_button]:text-sm [&_button]:font-bold [&_button]:transition-all [&_button]:duration-300 [&_button]:hover:-translate-y-0.5 [&_button]:hover:shadow-lg">
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(note)}>
          Editar
        </button>

        <button
          type="button"
          className="note-card__delete text-red-700"
          onClick={() => onDelete(note.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="note-card__details relative mt-3 rounded-3xl border p-5 backdrop-blur-md animate-fade-in">
          <div className="note-card__details-header [&_strong]:inline-flex [&_strong]:rounded-2xl [&_strong]:px-4 [&_strong]:py-2 [&_strong]:text-sm [&_strong]:font-extrabold">
            <div>
              <span>Ficha desplegada</span>
              <h4>Información de la nota</h4>
            </div>

            <strong>{note.hallazgoId ? "Vinculada" : "General"}</strong>
          </div>

          <div className="note-card__detail-grid mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem
              label="Hallazgo relacionado"
              value={
                loadingRelations
                  ? "Cargando hallazgo..."
                  : showValue(relatedFindingLabel)
              }
            />

            <DetailItem
              label="Documento relacionado"
              value={
                loadingRelations
                  ? "Cargando documento..."
                  : showValue(relatedDocumentLabel)
              }
            />

            <DetailItem
              label="Subrayado relacionado"
              value={
                loadingRelations
                  ? "Cargando subrayado..."
                  : note.subrayadoId
                  ? "Sí"
                  : "No registrado"
              }
            />

            <DetailItem
              label="Fecha de creación"
              value={formatDate(note.fechaCreacion)}
            />

            <DetailItem
              label="Fecha de actualización"
              value={formatDate(note.fechaActualizacion)}
            />
          </div>

          <div className="note-card__relations mt-5 rounded-3xl border bg-white p-5 shadow-sm">
            <div className="note-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayado, documento y hallazgo vinculado</h4>
              </div>
            </div>

            <div className="note-card__relation-summary mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 [&_div]:rounded-2xl [&_div]:border [&_div]:px-4 [&_div]:py-3 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_span]:mt-1 [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-500">
              <div>
                <strong>{note.subrayadoId ? 1 : 0}</strong>
                <span>Subrayados vinculados</span>
              </div>

              <div>
                <strong>{note.hallazgoId ? 1 : 0}</strong>
                <span>Hallazgos relacionados</span>
              </div>

              <div>
                <strong>{note.documentoId ? 1 : 0}</strong>
                <span>Documentos relacionados</span>
              </div>
            </div>

            {loadingRelations && (
              <p className="note-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Cargando subrayado relacionado...
              </p>
            )}

            {!loadingRelations && !relations && (
              <p className="note-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Esta nota no tiene un subrayado relacionado desde documentos.
              </p>
            )}

            {!loadingRelations && relations && (
              <article className="note-card__highlight-item rounded-3xl border p-4 shadow-sm [&_h5]:mb-3 [&_h5]:text-base [&_h5]:font-extrabold [&_h5]:text-slate-900">
                <div className="note-card__highlight-top mb-3 flex flex-wrap items-center gap-2">
                  <span>{relations.subrayado.tipo}</span>

                  {relations.hallazgo && <strong>Hallazgo vinculado</strong>}

                  {relations.evidencia && <strong>Evidencia vinculada</strong>}

                  {relations.documento && <strong>Documento vinculado</strong>}
                </div>

                <h5>
                  {relations.documento?.nombreOriginal ||
                    "Documento no disponible"}
                </h5>

                <div className="note-card__highlight-text mb-3 rounded-2xl bg-white p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                  <label>Texto subrayado</label>
                  <p>{showValue(relations.subrayado.textoSubrayado)}</p>
                </div>

                <div className="note-card__highlight-meta grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:bg-white [&_div]:p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                  <div>
                    <label>Subtítulo del subrayado</label>
                    <p>{showValue(relations.subrayado.subtitulo)}</p>
                  </div>

                  <div>
                    <label>Observación del subrayado</label>
                    <p>{showValue(relations.subrayado.observacion)}</p>
                  </div>
                </div>

                {(relations.hallazgo || relations.evidencia) && (
                  <div className="note-card__linked-data mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:border [&_div]:bg-white [&_div]:p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:font-semibold [&_p]:leading-6 [&_p]:text-slate-700">
                    {relations.hallazgo && (
                      <div>
                        <label>Hallazgo relacionado</label>
                        <p>
                          {relations.hallazgo.codigo} -{" "}
                          {relations.hallazgo.nombre}
                        </p>
                      </div>
                    )}

                    {relations.evidencia && (
                      <div>
                        <label>Evidencia relacionada</label>
                        <p>
                          {relations.evidencia.codigo} -{" "}
                          {relations.evidencia.nombre}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="note-card__highlight-footer mt-3 flex flex-col gap-3 border-t border-pink-100 pt-3 md:flex-row md:items-center md:justify-between [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-500 [&_a]:inline-flex [&_a]:justify-center [&_a]:rounded-2xl [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-bold [&_a]:no-underline [&_a]:transition">
                  <span>
                    Creado: {formatDate(relations.subrayado.fechaCreacion)}
                  </span>

                  {relations.documento?.id && (
                    <Link
                      to={`/projects/${note.proyectoId}/documents/${relations.documento.id}/viewer`}
                    >
                      Abrir documento
                    </Link>
                  )}
                </div>
              </article>
            )}
          </div>
        </section>
      )}
    </article>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="note-card__detail-item rounded-2xl border bg-white px-4 py-3 shadow-sm [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:break-words [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-slate-800">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default NoteCard;