import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import { projectApi } from "../api/projectApi";
import { Project, ProjectCreate } from "../types/project";
import "../styles/pages/ProjectsPage.css";

function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [] as Project[], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el proyecto.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectCreate }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProject(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el proyecto.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar el proyecto.");
    },
  });

  const handleSubmit = async (data: ProjectCreate) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (projectId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este proyecto?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(projectId);
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
            loading={isLoading}
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