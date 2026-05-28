import toast from "react-hot-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  findingApi,
  FindingRelatedDocumentItem,
} from "../../api/findingApi";
import { Finding } from "../../types/finding";
import "../../styles/components/findings/FindingCard.css";

interface FindingCardProps {
  finding: Finding;
  onEdit: (finding: Finding) => void;
  onDelete: (findingId: string) => void;
}

function FindingCard({ finding, onEdit, onDelete }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [relatedItems, setRelatedItems] = useState<FindingRelatedDocumentItem[]>(
    []
  );
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [relatedLoaded, setRelatedLoaded] = useState(false);

  const levelClass = finding.nivel.replace(" ", "-").toLowerCase();

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

  const loadRelatedDocuments = async () => {
    if (relatedLoaded) return;

    try {
      setLoadingRelated(true);

      const response = await findingApi.getRelatedDocuments(finding.id);

      setRelatedItems(response.documentosRelacionados || []);
      setRelatedLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los subrayados relacionados.");
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleToggleDetails = async () => {
    const nextExpandedState = !expanded;

    setExpanded(nextExpandedState);

    if (nextExpandedState) {
      await loadRelatedDocuments();
    }
  };

  return (
    <article className={expanded ? "finding-card finding-card--expanded" : "finding-card"}>
      <div className="finding-card__main min-w-0 flex-1">
        <div className="finding-card__top mb-3 flex flex-wrap items-center gap-2">
          <span className="finding-card__code rounded-full border px-3 py-1 text-xs font-bold uppercase">{finding.codigo}</span>

          <span
            className={`finding-card__level finding-card__level--${levelClass}`}
          >
            {finding.nivel}
          </span>
        </div>

        <h3>{finding.nombre}</h3>

        <p>
          {finding.descripcion
            ? finding.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="finding-card__risk mb-3 grid grid-cols-3 gap-2 [&_div]:rounded-2xl [&_div]:border [&_div]:px-3 [&_div]:py-2 [&_div]:transition-all [&_div]:duration-300 [&_div]:hover:scale-105 [&_div]:hover:shadow-md [&_strong]:block [&_strong]:text-lg [&_strong]:font-extrabold [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-slate-500">
          <div>
            <strong>{finding.impacto}</strong>
            <span>Impacto</span>
          </div>

          <div>
            <strong>{finding.urgencia}</strong>
            <span>Urgencia</span>
          </div>

          <div>
            <strong>{finding.riesgo}</strong>
            <span>Riesgo</span>
          </div>
        </div>

        <div className="finding-card__meta flex flex-wrap gap-2 text-xs font-semibold text-slate-500 [&_span]:rounded-xl [&_span]:bg-slate-50 [&_span]:px-3 [&_span]:py-2">
          <span>Evidencias: {finding.evidencias.length}</span>
          <span>Subrayados: {finding.subrayados.length}</span>
        </div>
      </div>

      <div className="finding-card__actions flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(finding)}>
          Editar
        </button>

        <a
          href={findingApi.downloadPdfUrl(finding.id)}
          target="_blank"
          rel="noreferrer"
        >
          PDF
        </a>

        <a
          href={findingApi.downloadWordUrl(finding.id)}
          target="_blank"
          rel="noreferrer"
        >
          Word
        </a>

        <button
          type="button"
          className="finding-card__delete text-red-700"
          onClick={() => onDelete(finding.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="finding-card__details relative mt-3 rounded-3xl border p-5 backdrop-blur-md animate-fade-in">
          <div className="finding-card__details-header [&_strong]:inline-flex [&_strong]:rounded-2xl [&_strong]:px-4 [&_strong]:py-2 [&_strong]:text-sm [&_strong]:font-extrabold">
            <div>
              <span>Ficha completa</span>
              <h4>Información del hallazgo</h4>
            </div>

            <strong>{finding.codigo}</strong>
          </div>

          <div className="finding-card__detail-grid mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Nombre" value={showValue(finding.nombre)} />
            <DetailItem label="Código" value={showValue(finding.codigo)} />
            <DetailItem label="Nivel" value={showValue(finding.nivel)} />
            <DetailItem label="Riesgo" value={showValue(finding.riesgo)} />
            <DetailItem label="Impacto" value={showValue(finding.impacto)} />
            <DetailItem label="Urgencia" value={showValue(finding.urgencia)} />
            <DetailItem
              label="Fecha de creación"
              value={formatDate(finding.fechaCreacion)}
            />
            <DetailItem
              label="Fecha de actualización"
              value={formatDate(finding.fechaActualizacion)}
            />
          </div>

          <div className="finding-card__text-grid grid grid-cols-1 gap-3 xl:grid-cols-2">
            <DetailBlock
              label="Descripción"
              value={showValue(finding.descripcion)}
            />

            <DetailBlock label="Criterio" value={showValue(finding.criterio)} />

            <DetailBlock label="Objetivo" value={showValue(finding.objetivo)} />

            <DetailBlock label="Causa" value={showValue(finding.causa)} />

            <DetailBlock label="Efecto" value={showValue(finding.efecto)} />

            <DetailBlock
              label="Conclusión"
              value={showValue(finding.conclusion)}
            />

            <DetailBlock
              label="Justificación del riesgo"
              value={showValue(finding.justificacionRiesgo)}
            />

            <DetailBlock
              label="Recomendaciones"
              value={showValue(finding.recomendaciones)}
            />
          </div>

          <div className="finding-card__relations mt-5 rounded-3xl border bg-white p-5 shadow-sm">
            <div className="finding-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayados, documentos y evidencias</h4>
              </div>
            </div>

            <div className="finding-card__relation-summary mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:border [&_div]:px-4 [&_div]:py-3 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_span]:mt-1 [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-500">
              <div>
                <strong>{finding.evidencias.length}</strong>
                <span>Evidencias vinculadas</span>
              </div>

              <div>
                <strong>{finding.subrayados.length}</strong>
                <span>Subrayados vinculados</span>
              </div>
            </div>

            {loadingRelated && (
              <p className="finding-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Cargando subrayados relacionados...
              </p>
            )}

            {!loadingRelated && relatedItems.length === 0 && (
              <p className="finding-card__related-state mb-0 rounded-2xl border border-dashed p-5 text-center text-sm font-semibold text-slate-500">
                Este hallazgo todavía no tiene subrayados relacionados desde
                documentos.
              </p>
            )}

            {!loadingRelated && relatedItems.length > 0 && (
              <div className="finding-card__highlight-list flex flex-col gap-3 w-full">
                {relatedItems.map((item) => {
                  const documentId = item.documento?.id;
                  const documentName =
                    item.documento?.nombreOriginal || "Documento no disponible";

                  return (
                    <article
                      key={item.subrayado.id}
                      className="finding-card__highlight-item [&_h5]:mb-3 [&_h5]:text-base [&_h5]:font-extrabold [&_h5]:text-slate-900 block w-full max-w-none rounded-3xl border p-4 shadow-sm"
                    >
                      <div className="finding-card__highlight-top mb-3 flex flex-wrap items-center gap-2">
                        <span>{item.subrayado.tipo}</span>

                        {item.subrayado.esNota && <strong>Nota</strong>}
                      </div>

                      <h5>{documentName}</h5>

                      <div className="finding-card__highlight-text mb-3 block w-full max-w-none rounded-2xl bg-white p-4 [&_label]:mb-2 [&_label]:block [&_label]:w-full [&_label]:text-xs [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-slate-400 [&_p]:block [&_p]:w-full [&_p]:max-w-none [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                        <label>Texto subrayado</label>
                        <p>{showValue(item.subrayado.textoSubrayado)}</p>
                      </div>

                      <div className="finding-card__highlight-meta grid grid-cols-1 gap-3 md:grid-cols-2 [&_div]:rounded-2xl [&_div]:bg-white [&_div]:p-4 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
                        <div>
                          <label>Subtítulo</label>
                          <p>{showValue(item.subrayado.subtitulo)}</p>
                        </div>

                        <div>
                          <label>Observación</label>
                          <p>{showValue(item.subrayado.observacion)}</p>
                        </div>
                      </div>

                      <div className="finding-card__highlight-footer mt-3 flex flex-col gap-3 border-t border-orange-100 pt-3 md:flex-row md:items-center md:justify-between [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-500 [&_a]:inline-flex [&_a]:justify-center [&_a]:rounded-2xl [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-bold [&_a]:no-underline [&_a]:transition">
                        <span>
                          Creado: {formatDate(item.subrayado.fechaCreacion)}
                        </span>

                        {documentId && (
                          <Link
                            to={`/projects/${finding.proyectoId}/documents/${documentId}/viewer`}
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
    <div className="finding-card__detail-item rounded-2xl border bg-white px-4 py-3 shadow-sm [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:break-words [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-slate-800">
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
    <div className="finding-card__detail-block rounded-2xl border bg-white p-4 shadow-sm [&_span]:mb-2 [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-700">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

export default FindingCard;