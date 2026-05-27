export type DocumentType = "pdf" | "docx";

export interface AuditDocument {
  id: string;
  proyectoId: string;

  nombreOriginal: string;
  nombreArchivo: string;

  tipoArchivo: DocumentType;
  extension: string;

  rutaArchivo: string;
  tamanioBytes?: number | null;

  fechaSubida: string;
}