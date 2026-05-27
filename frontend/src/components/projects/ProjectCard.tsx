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
        <div className="project-card__top">
          <span className="project-card__status">{project.estado}</span>
          <span className="project-card__date">
            {new Date(project.fechaCreacion).toLocaleDateString()}
          </span>
        </div>

        <h3>{project.nombre}</h3>

        <p>
          {project.descripcion
            ? project.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="project-card__stats">
          <div>
            <strong>{project.documentos.length}</strong>
            <span>Documentos</span>
          </div>

          <div>
            <strong>{project.hallazgos.length}</strong>
            <span>Hallazgos</span>
          </div>

          <div>
            <strong>{project.evidencias.length}</strong>
            <span>Evidencias</span>
          </div>

          <div>
            <strong>{project.notas.length}</strong>
            <span>Notas</span>
          </div>
        </div>
      </div>

      <div className="project-card__actions">
        <button
          className="project-card__open"
          onClick={() => onOpen(project.id)}
        >
          Abrir proyecto
        </button>

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