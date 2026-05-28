import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { matrixApi } from "../api/matrixApi";
import MatrixTable from "../components/matrix/MatrixTable";
import { Finding } from "../types/finding";
import "../styles/pages/MatrixPage.css";

function MatrixPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const currentProjectId = projectId || "";

  const { data, isLoading: loading } = useQuery({
    queryKey: ["matrix", currentProjectId],
    queryFn: () => matrixApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const findings = data?.matriz || [];
  const totalRows = data?.totalFilas || 0;

  const highestRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    return Math.max(...findings.map((finding: Finding) => finding.riesgo || 0));
  }, [findings]);

  const highOrExtreme = useMemo(() => {
    return findings.filter(
      (finding: Finding) => finding.nivel === "Alto" || finding.nivel === "Extremo"
    ).length;
  }, [findings]);

  const averageRisk = useMemo(() => {
    if (findings.length === 0) return 0;

    const total = findings.reduce(
      (sum: number, finding: Finding) => sum + (finding.riesgo || 0),
      0
    );

    return Number((total / findings.length).toFixed(1));
  }, [findings]);

  return (
    <main className="matrix-page">
      <button
        className="matrix-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="matrix-page__hero">
        <div className="matrix-page__hero-content">
          <span className="matrix-page__eyebrow">Consolidado de auditoría</span>

          <h1>Matriz de hallazgos</h1>

          <p>
            La matriz consolida los hallazgos registrados en el proyecto,
            mostrando sus criterios, riesgos, niveles y recomendaciones en una
            vista estructurada para revisión y descarga.
          </p>
        </div>

        <div className="matrix-page__summary">
          <span>Total filas</span>
          <strong>{totalRows}</strong>
        </div>
      </section>

      <section className="matrix-page__stats">
        <article>
          <strong>{totalRows}</strong>
          <span>Filas generadas</span>
        </article>

        <article>
          <strong>{highOrExtreme}</strong>
          <span>Alto o extremo</span>
        </article>

        <article>
          <strong>{averageRisk}</strong>
          <span>Riesgo promedio</span>
        </article>

        <article>
          <strong>{highestRisk}</strong>
          <span>Riesgo máximo</span>
        </article>
      </section>

      <section className="matrix-page__workspace">
        <div className="matrix-page__section-header">
          <div>
            <h2>Detalle de matriz</h2>
            <p>
              Cada fila representa un hallazgo registrado dentro del proyecto.
            </p>
          </div>

          <a
            className="matrix-page__download"
            href={matrixApi.downloadExcelUrl(currentProjectId)}
            target="_blank"
            rel="noreferrer"
          >
            Descargar Excel
          </a>
        </div>

        <MatrixTable findings={findings} loading={loading} />
      </section>
    </main>
  );
}

export default MatrixPage;