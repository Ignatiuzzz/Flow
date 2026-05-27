export interface Evidence {
  id: string;
  proyectoId: string;

  hallazgoId?: string | null;

  nombre: string;
  codigo: string;

  criterio?: string | null;
  objetivo?: string | null;

  descripcionEvidencia?: string | null;

  documentoId?: string | null;
  documentoNombre?: string | null;

  subtitulo?: string | null;

  subrayados: string[];

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface EvidenceCreate {
  proyectoId: string;

  hallazgoId?: string;

  nombre: string;
  codigo: string;

  criterio?: string;
  objetivo?: string;

  descripcionEvidencia?: string;

  documentoId?: string;
  documentoNombre?: string;

  subtitulo?: string;

  subrayados?: string[];
}

export interface EvidenceUpdate {
  hallazgoId?: string;

  nombre?: string;
  codigo?: string;

  criterio?: string;
  objetivo?: string;

  descripcionEvidencia?: string;

  documentoId?: string;
  documentoNombre?: string;

  subtitulo?: string;

  subrayados?: string[];
}