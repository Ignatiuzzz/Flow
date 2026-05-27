import { useNavigate, useParams } from "react-router-dom";
import "../styles/pages/ProjectDetailPage.css";

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const currentProjectId = projectId || "";

  return (
    <main className="project-detail-page">
      <button
        className="project-detail-page__back"
        onClick={() => navigate("/")}
      >
        Volver a proyectos
      </button>

      <section className="project-detail-page__header">
        <h1>Detalle del proyecto</h1>
        <p>ID del proyecto: {currentProjectId}</p>
      </section>

      <section className="project-detail-page__modules">
        <button
          onClick={() => navigate(`/projects/${currentProjectId}/documents`)}
        >
          Documentos
        </button>

        <button
          onClick={() => navigate(`/projects/${currentProjectId}/findings`)}
        >
          Hallazgos
        </button>

        <button
          onClick={() => navigate(`/projects/${currentProjectId}/evidences`)}
        >
          Evidencias
        </button>

        <button onClick={() => navigate(`/projects/${currentProjectId}/notes`)}>
          Notas
        </button>

        <button onClick={() => navigate(`/projects/${currentProjectId}/matrix`)}>
          Matriz
        </button>
      </section>
    </main>
  );
}

export default ProjectDetailPage;