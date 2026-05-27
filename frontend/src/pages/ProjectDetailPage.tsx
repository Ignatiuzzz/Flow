import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectApi } from "../api/projectApi";
import { Project } from "../types/project";
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

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadProject = async () => {
    if (!currentProjectId) return;

    try {
      setLoading(true);
      const data = await projectApi.getById(currentProjectId);
      setProject(data);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [currentProjectId]);

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
    <main className="project-detail-page">
      <button
        className="project-detail-page__back"
        onClick={() => navigate("/")}
      >
        ← Volver a proyectos
      </button>

      <section className="project-detail-page__hero">
        <div className="project-detail-page__hero-content">
          <span className="project-detail-page__eyebrow">
            Panel del proyecto
          </span>

          <h1>{loading ? "Cargando proyecto..." : project?.nombre || "Proyecto"}</h1>

          <p>
            {project?.descripcion
              ? project.descripcion
              : "Gestiona los documentos, hallazgos, evidencias, notas y matriz relacionados con este proyecto de auditoría."}
          </p>
        </div>

        <div className="project-detail-page__status-card">
          <span>Estado</span>
          <strong>{project?.estado || "activo"}</strong>
        </div>
      </section>

      <section className="project-detail-page__summary">
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

      <section className="project-detail-page__workspace">
        <div className="project-detail-page__section-header">
          <div>
            <h2>Módulos de trabajo</h2>
            <p>
              Selecciona el módulo que necesitas para continuar con la gestión
              del proyecto.
            </p>
          </div>
        </div>

        <div className="project-detail-page__modules">
          {modules.map((module) => (
            <button
              key={module.title}
              className={`project-detail-page__module project-detail-page__module--${module.variant}`}
              onClick={() => navigate(module.path)}
            >
              <div className="project-detail-page__module-top">
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