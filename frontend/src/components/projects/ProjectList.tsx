import { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";
import "../../styles/components/projects/ProjectList.css";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onOpen: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

function ProjectList({
  projects,
  loading,
  onOpen,
  onEdit,
  onDelete,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="project-list__state">
        <div className="project-list__loader" />
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-list__state">
        <h3>No hay proyectos todavía</h3>
        <p>
          Crea tu primer proyecto para comenzar a registrar documentos,
          hallazgos, evidencias y notas.
        </p>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ProjectList;