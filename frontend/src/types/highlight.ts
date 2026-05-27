import { Evidence } from "./evidence";
import { Finding } from "./finding";
import { Note } from "./note";
import { AuditDocument } from "./document";

export type HighlightType = "HALLAZGO" | "EVIDENCIA" | "NOTA";

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HighlightPageCoordinates {
  pagina: number;
  rects: HighlightRect[];
}

export interface HighlightCoordinates {
  paginas: HighlightPageCoordinates[];
}

export interface Highlight {
  id: string;

  proyectoId: string;
  documentoId: string;

  textoSubrayado: string;

  subtitulo?: string | null;
  observacion?: string | null;

  tipo: HighlightType;

  esNota: boolean;

  hallazgoId?: string | null;
  evidenciaId?: string | null;
  notaId?: string | null;

  coordenadas?: HighlightCoordinates | null;

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface HighlightRelations {
  subrayado: Highlight;
  documento?: AuditDocument | null;
  hallazgo?: Finding | null;
  evidencia?: Evidence | null;
  nota?: Note | null;
}