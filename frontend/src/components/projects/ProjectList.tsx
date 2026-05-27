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
    return <p className="project-list__message">Cargando proyectos...</p>;
  }

  if (projects.length === 0) {
    return (
      <p className="project-list__message">
        Todavía no hay proyectos registrados.
      </p>
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