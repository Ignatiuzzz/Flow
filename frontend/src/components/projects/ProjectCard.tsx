import { Project } from "../../types/project";
import "../../styles/components/projects/ProjectCard.css";

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

function ProjectCard({ project, onOpen, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-card__content">
        <span className="project-card__status">{project.estado}</span>

        <h3>{project.nombre}</h3>

        <p>
          {project.descripcion
            ? project.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="project-card__meta">
          <span>Hallazgos: {project.hallazgos.length}</span>
          <span>Evidencias: {project.evidencias.length}</span>
          <span>Notas: {project.notas.length}</span>
        </div>
      </div>

      <div className="project-card__actions">
        <button onClick={() => onOpen(project.id)}>Abrir</button>
        <button onClick={() => onEdit(project)}>Editar</button>
        <button
          className="project-card__delete"
          onClick={() => onDelete(project.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;