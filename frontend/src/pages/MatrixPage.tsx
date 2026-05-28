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
    <main className="matrix-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="matrix-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="matrix-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="matrix-page__hero-content max-w-4xl">
          <span className="matrix-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">Consolidado de auditoría</span>

          <h1>Matriz de hallazgos</h1>

          <p>
            La matriz consolida los hallazgos registrados en el proyecto,
            mostrando sus criterios, riesgos, niveles y recomendaciones en una
            vista estructurada para revisión y descarga.
          </p>
        </div>

        <div className="matrix-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center text-white shadow-xl ring-1 hover:shadow-[0_0_20px_rgba(39,63,104,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total filas</span>
          <strong>{totalRows}</strong>
        </div>
      </section>

      <section className="matrix-page__stats mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
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
        <div className="matrix-page__section-header mb-4 flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
          <div>
            <h2>Detalle de matriz</h2>
            <p>
              Cada fila representa un hallazgo registrado dentro del proyecto.
            </p>
          </div>

          <a
            className="matrix-page__download inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white no-underline shadow-sm transition"
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