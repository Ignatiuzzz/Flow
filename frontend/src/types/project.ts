export type ProjectStatus = "activo" | "finalizado" | "archivado";

export interface Project {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estado: ProjectStatus;

  documentos: string[];
  hallazgos: string[];
  evidencias: string[];
  notas: string[];

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProjectCreate {
  nombre: string;
  descripcion?: string;
}

export interface ProjectUpdate {
  nombre?: string;
  descripcion?: string;
  estado?: ProjectStatus;
}