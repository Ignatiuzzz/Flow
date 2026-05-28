import toast from "react-hot-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Evidence } from "../../types/evidence";
import { evidenceApi } from "../../api/evidenceApi";
import { highlightApi } from "../../api/highlightApi";
import { HighlightRelations } from "../../types/highlight";
import "../../styles/components/evidences/EvidenceCard.css";

interface EvidenceCardProps {
  evidence: Evidence;
  onEdit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
}

function EvidenceCard({ evidence, onEdit, onDelete }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [highlightRelations, setHighlightRelations] = useState<
    HighlightRelations[]
  >([]);
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

  const loadHighlightRelations = async () => {
    if (relationsLoaded) return;

    if (!evidence.subrayados || evidence.subrayados.length === 0) {
      setHighlightRelations([]);
      setRelationsLoaded(true);
      return;
    }

    try {
      setLoadingRelations(true);

      const relations = await Promise.all(
        evidence.subrayados.map((highlightId) =>
          highlightApi.getRelations(highlightId)
        )
      );

      setHighlightRelations(relations);
      setRelationsLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los subrayados de la evidencia.");
    } finally {
      setLoadingRelations(false);
    }
  };

  const handleToggleDetails = async () => {
    const nextExpandedState = !expanded;

    setExpanded(nextExpandedState);

    if (nextExpandedState) {
      await loadHighlightRelations();
    }
  };

  const relatedFinding = highlightRelations.find(
    (relation) => relation.hallazgo
  )?.hallazgo;

  const relatedFindingLabel = relatedFinding
    ? `${relatedFinding.codigo} - ${relatedFinding.nombre}`
    : evidence.hallazgoId
    ? "Hallazgo relacionado"
    : "No registrado";

  return (
    <article
      className={
        expanded ? "evidence-card evidence-card--expanded" : "evidence-card"
      }
    >
      <div className="evidence-card__main min-w-0 flex-1">
        <div className="evidence-card__top mb-3 flex flex-wrap items-center gap-2">
          <span className="evidence-card__code rounded-full border px-3 py-1 text-xs font-bold uppercase">{evidence.codigo}</span>

          {evidence.hallazgoId && (
            <span className="evidence-card__linked rounded-full border px-3 py-1 text-xs font-bold">
              Relacionada a hallazgo
            </span>
          )}
        </div>

        <h3>{evidence.nombre}</h3>

        <p>
          {evidence.descripcionEvidencia
            ? evidence.descripcionEvidencia
            : "Sin descripción registrada."}
        </p>

        <div className="evidence-card__meta flex flex-wrap gap-2 text-xs font-semibold text-slate-500 [&_span]:rounded-xl [&_span]:px-3 [&_span]:py-2">
          <span>Subrayados: {evidence.subrayados.length}</span>
        </div>
      </div>

      <div className="evidence-card__actions flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(evidence)}>
          Editar
        </button>

        <a
          href={evidenceApi.downloadPdfUrl(evidence.id)}
          target="_blank"
          rel="noreferrer"
        >
          PDF
        </a>

        <a
          href={evidenceApi.downloadWordUrl(evidence.id)}
          target="_blank"
          rel="noreferrer"
        >
          Word
        </a>

        <button
          type="button"
          className="evidence-card__delete text-red-700"
          onClick={() => onDelete(evidence.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="evidence-card__details relative mt-3 rounded-3xl border p-5 backdrop-blur-md animate-fade-in">
          <div className="evidence-card__details-header [&_strong]:inline-flex [&_strong]:rounded-2xl [&_strong]:px-4 [&_strong]:py-2 [&_strong]:text-sm [&_strong]:font-extrabold">
            <div>
              <span>Ficha desplegada</span>
              <h4>Información de la evidencia</h4>
            </div>

            <strong>{evidence.codigo}</strong>
          </div>

          <div className="evidence-card__detail-grid mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Nombre" value={showValue(evidence.nombre)} />

            <DetailItem label="Código" value={showValue(evidence.codigo)} />

            <DetailItem
              label="Hallazgo relacionado"
              value={
                loadingRelations
                  ? "Cargando hallazgo..."
                  : showValue(relatedFindingLabel)
              }
            />

            <DetailItem
              label="Subrayados"
              value={evidence.subrayados.length}
            />

            <DetailItem
              label="Fecha de creación"
              value={formatDate(evidence.fechaCreacion)}
            />

            <DetailItem
              label="Fecha de actualización"
              value={formatDate(evidence.fechaActualizacion)}
            />
          </div>

          {evidence.objetivo && (
            <div className="evidence-card__text-grid grid grid-cols-1 gap-3 xl:grid-cols-2">
              <DetailBlock
                label="Objetivo"
                value={showValue(evidence.objetivo)}
              />
            </div>
          )}

          <div className="evidence-card__relations mt-5 rounded-3xl border bg-white p-5 shadow-sm">
            <div className="evidence-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayados vinculados a la evidencia</h4>
              </div>
            </div>

            <div className="evidence-card__relation-summary mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:border [&_div]:px-4 [&_div]:py-3 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_span]:mt-1 [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-500">
              <div>
                <strong>{evidence.subrayados.length}</strong>
                <span>Subrayados vinculados</span>
              </div>

              <div>
                <strong>{relatedFinding || evidence.hallazgoId ? 1 : 0}</strong>
                <span>Hallazgos relacionados</span>
              </div>
            </div>

            {loadingRelations && (
              <p className="evidence-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Cargando subrayados relacionados...
              </p>
            )}

            {!loadingRelations && highlightRelations.length === 0 && (
              <p className="evidence-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Esta evidencia todavía no tiene subrayados relacionados desde
                documentos.
              </p>
            )}

            {!loadingRelations && highlightRelations.length > 0 && (
              <div className="evidence-card__highlight-list flex flex-col gap-3">
                {highlightRelations.map((relations) => {
                  const { subrayado, documento, hallazgo, nota } = relations;

                  const documentId = documento?.id;
                  const documentName =
                    documento?.nombreOriginal || "Documento no disponible";

                  return (
                    <article
                      key={subrayado.id}
                      className="evidence-card__highlight-item rounded-3xl border p-4 shadow-sm [&_h5]:mb-3 [&_h5]:text-base [&_h5]:font-extrabold [&_h5]:text-slate-900"
                    >
                      <div className="evidence-card__highlight-top mb-3 flex flex-wrap items-center gap-2">
                        <span>{subrayado.tipo}</span>

                        {hallazgo && <strong>Hallazgo vinculado</strong>}

                        {nota && <strong>Nota vinculada</strong>}
                      </div>

                      <h5>{documentName}</h5>

                      <div className="evidence-card__highlight-text mb-3 rounded-2xl bg-white p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                        <label>Texto subrayado</label>
                        <p>{showValue(subrayado.textoSubrayado)}</p>
                      </div>

                      <div className="evidence-card__highlight-meta grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:bg-white [&_div]:p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                        <div>
                          <label>Subtítulo</label>
                          <p>{showValue(subrayado.subtitulo)}</p>
                        </div>

                        <div>
                          <label>Observación</label>
                          <p>{showValue(subrayado.observacion)}</p>
                        </div>
                      </div>

                      {(hallazgo || nota) && (
                        <div className="evidence-card__linked-data mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:border [&_div]:bg-white [&_div]:p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:font-semibold [&_p]:leading-6 [&_p]:text-slate-700">
                          {hallazgo && (
                            <div>
                              <label>Hallazgo relacionado</label>
                              <p>
                                {hallazgo.codigo} - {hallazgo.nombre}
                              </p>
                            </div>
                          )}

                          {nota && (
                            <div>
                              <label>Nota relacionada</label>
                              <p>{nota.subtitulo || nota.texto}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="evidence-card__highlight-footer mt-3 flex flex-col gap-3 border-t border-blue-100 pt-3 md:flex-row md:items-center md:justify-between [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-500 [&_a]:inline-flex [&_a]:justify-center [&_a]:rounded-2xl [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-bold [&_a]:no-underline [&_a]:transition">
                        <span>
                          Creado: {formatDate(subrayado.fechaCreacion)}
                        </span>

                        {documentId && (
                          <Link
                            to={`/projects/${evidence.proyectoId}/documents/${documentId}/viewer`}
                          >
                            Abrir documento
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
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
    <div className="evidence-card__detail-item rounded-2xl border bg-white px-4 py-3 shadow-sm [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:break-words [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-slate-800">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

interface DetailBlockProps {
  label: string;
  value: string | number;
}

function DetailBlock({ label, value }: DetailBlockProps) {
  return (
    <div className="evidence-card__detail-block rounded-2xl border bg-white p-4 shadow-sm [&_span]:mb-2 [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

export default EvidenceCard;