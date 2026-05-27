export interface Note {
  id: string;

  proyectoId: string;

  hallazgoId?: string | null;
  documentoId?: string | null;
  subrayadoId?: string | null;

  subtitulo?: string | null;
  texto: string;

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface NoteCreate {
  proyectoId: string;

  hallazgoId?: string;
  documentoId?: string;
  subrayadoId?: string;

  subtitulo?: string;
  texto: string;
}

export interface NoteUpdate {
  hallazgoId?: string;
  documentoId?: string;
  subrayadoId?: string;

  subtitulo?: string;
  texto?: string;
}