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

  return (
    <article className={expanded ? "note-card note-card--expanded" : "note-card"}>
      <div className="note-card__main">
        <div className="note-card__top">
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

      <div className="note-card__actions">
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(note)}>
          Editar
        </button>

        <button
          type="button"
          className="note-card__delete"
          onClick={() => onDelete(note.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="note-card__details">
          <div className="note-card__details-header">
            <div>
              <span>Ficha desplegada</span>
              <h4>Información de la nota</h4>
            </div>

            <strong>{note.hallazgoId ? "Vinculada" : "General"}</strong>
          </div>

          <div className="note-card__detail-grid">
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

          <div className="note-card__relations">
            <div className="note-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayado, documento y hallazgo vinculado</h4>
              </div>
            </div>

            <div className="note-card__relation-summary">
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
              <p className="note-card__related-state">
                Cargando subrayado relacionado...
              </p>
            )}

            {!loadingRelations && !relations && (
              <p className="note-card__related-state">
                Esta nota no tiene un subrayado relacionado desde documentos.
              </p>
            )}

            {!loadingRelations && relations && (
              <article className="note-card__highlight-item">
                <div className="note-card__highlight-top">
                  <span>{relations.subrayado.tipo}</span>

                  {relations.hallazgo && <strong>Hallazgo vinculado</strong>}

                  {relations.evidencia && <strong>Evidencia vinculada</strong>}

                  {relations.documento && <strong>Documento vinculado</strong>}
                </div>

                <h5>
                  {relations.documento?.nombreOriginal ||
                    "Documento no disponible"}
                </h5>

                <div className="note-card__highlight-text">
                  <label>Texto subrayado</label>
                  <p>{showValue(relations.subrayado.textoSubrayado)}</p>
                </div>

                <div className="note-card__highlight-meta">
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
                  <div className="note-card__linked-data">
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

                <div className="note-card__highlight-footer">
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
    <div className="note-card__detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default NoteCard;