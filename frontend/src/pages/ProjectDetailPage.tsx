import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "../api/projectApi";
import "../styles/pages/ProjectDetailPage.css";

interface ModuleCard {
  title: string;
  description: string;
  metric: string;
  path: string;
  variant: "documents" | "findings" | "evidences" | "notes" | "matrix";
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const currentProjectId = projectId || "";

  const { data: project, isLoading: loading } = useQuery({
    queryKey: ["project", currentProjectId],
    queryFn: () => projectApi.getById(currentProjectId),
    enabled: !!currentProjectId,
  });

  const modules: ModuleCard[] = [
    {
      title: "Documentos",
      description: "Archivos base del proyecto para revisión y respaldo.",
      metric: `${project?.documentos.length || 0} registrados`,
      path: `/projects/${currentProjectId}/documents`,
      variant: "documents",
    },
    {
      title: "Hallazgos",
      description: "Registro, evaluación y edición de hallazgos de auditoría.",
      metric: `${project?.hallazgos.length || 0} registrados`,
      path: `/projects/${currentProjectId}/findings`,
      variant: "findings",
    },
    {
      title: "Evidencias",
      description: "Respaldos vinculados a hallazgos o al proyecto.",
      metric: `${project?.evidencias.length || 0} registradas`,
      path: `/projects/${currentProjectId}/evidences`,
      variant: "evidences",
    },
    {
      title: "Notas",
      description: "Comentarios y observaciones del auditor.",
      metric: `${project?.notas.length || 0} registradas`,
      path: `/projects/${currentProjectId}/notes`,
      variant: "notes",
    },
    {
      title: "Matriz",
      description: "Consolidado generado a partir de los hallazgos.",
      metric: `${project?.hallazgos.length || 0} filas`,
      path: `/projects/${currentProjectId}/matrix`,
      variant: "matrix",
    },
  ];

  return (
    <main className="project-detail-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="project-detail-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate("/")}
      >
        ← Volver a proyectos
      </button>

      <section className="project-detail-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="project-detail-page__hero-content max-w-4xl">
          <span className="project-detail-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Panel del proyecto
          </span>

          <h1>{loading ? "Cargando proyecto..." : project?.nombre || "Proyecto"}</h1>

          <p>
            {project?.descripcion
              ? project.descripcion
              : "Gestiona los documentos, hallazgos, evidencias, notas y matriz relacionados con este proyecto de auditoría."}
          </p>
        </div>

        <div className="project-detail-page__status-card flex min-w-[135px] flex-col items-center justify-center rounded-2xl bg-emerald-950 px-4 py-3 text-center text-white shadow-xl ring-1 ring-emerald-700/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-xl [&_strong]:font-extrabold [&_strong]:capitalize [&_strong]:text-white">
          <span>Estado</span>
          <strong>{project?.estado || "activo"}</strong>
        </div>
      </section>

      <section className="project-detail-page__summary mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
        <article>
          <strong>{project?.documentos.length || 0}</strong>
          <span>Documentos</span>
        </article>

        <article>
          <strong>{project?.hallazgos.length || 0}</strong>
          <span>Hallazgos</span>
        </article>

        <article>
          <strong>{project?.evidencias.length || 0}</strong>
          <span>Evidencias</span>
        </article>

        <article>
          <strong>{project?.notas.length || 0}</strong>
          <span>Notas</span>
        </article>
      </section>

      <section className="project-detail-page__workspace rounded-3xl border border-white/20 bg-white/80 backdrop-blur-md p-4 shadow-2xl animate-fade-in-up">
        <div className="project-detail-page__section-header mb-3 flex flex-col gap-1 border-b border-slate-100 pb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
          <div>
            <h2>Módulos de trabajo</h2>
            <p>
              Selecciona el módulo que necesitas para continuar con la gestión
              del proyecto.
            </p>
          </div>
        </div>

        <div className="project-detail-page__modules grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {modules.map((module) => (
            <button
              key={module.title}
              className={`project-detail-page__module project-detail-page__module--${module.variant}`}
              onClick={() => navigate(module.path)}
            >
              <div className="project-detail-page__module-top flex flex-col gap-2 [&_span]:inline-flex [&_span]:w-fit [&_span]:rounded-full [&_span]:border [&_span]:px-3 [&_span]:py-1 [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_small]:text-xs [&_small]:font-bold [&_small]:text-slate-400">
                <span>{module.title}</span>
                <small>{module.metric}</small>
              </div>

              <p>{module.description}</p>

              <strong>Entrar al módulo →</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProjectDetailPage;