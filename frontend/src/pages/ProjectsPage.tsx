import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import { projectApi } from "../api/projectApi";
import { Project, ProjectCreate } from "../types/project";
import "../styles/pages/ProjectsPage.css";

function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSubmit = async (data: ProjectCreate) => {
    try {
      if (selectedProject) {
        await projectApi.update(selectedProject.id, data);
        setSelectedProject(null);
      } else {
        await projectApi.create(data);
      }

      await loadProjects();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el proyecto.");
    }
  };

  const handleDelete = async (projectId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este proyecto?"
    );

    if (!confirmed) return;

    try {
      await projectApi.delete(projectId);
      await loadProjects();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el proyecto.");
    }
  };

  const handleOpen = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <main className="projects-page">
      <section className="projects-page__hero">
        <div className="projects-page__hero-content">
          <span className="projects-page__eyebrow">
            Herramienta para Auditores
          </span>

          <h1>Proyectos de auditoría</h1>

          <p>
            Organiza trabajos de auditoría, registra hallazgos, relaciona
            evidencias, administra notas y genera la matriz consolidada del
            proyecto.
          </p>
        </div>

        <div className="projects-page__summary">
          <span>Total de proyectos</span>
          <strong>{projects.length}</strong>
        </div>
      </section>

      <section className="projects-page__content">
        <aside className="projects-page__side">
          <ProjectForm
            selectedProject={selectedProject}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedProject(null)}
          />
        </aside>

        <section className="projects-page__main">
          <div className="projects-page__section-header">
            <div>
              <h2>Proyectos registrados</h2>
              <p>
                Selecciona un proyecto para continuar con documentos,
                hallazgos, evidencias, notas y matriz.
              </p>
            </div>
          </div>

          <ProjectList
            projects={projects}
            loading={loading}
            onOpen={handleOpen}
            onEdit={setSelectedProject}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default ProjectsPage;