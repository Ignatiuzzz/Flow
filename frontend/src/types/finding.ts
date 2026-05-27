export type RiskLevel = "Muy Bajo" | "Bajo" | "Medio" | "Alto" | "Extremo";

export interface Finding {
  id: string;
  proyectoId: string;

  nombre: string;
  codigo: string;
  descripcion?: string | null;

  criterio?: string | null;
  objetivo?: string | null;
  causa?: string | null;
  efecto?: string | null;
  conclusion?: string | null;

  impacto: number;
  urgencia: number;
  riesgo: number;
  nivel: RiskLevel;

  justificacionRiesgo?: string | null;
  recomendaciones?: string | null;

  subrayados: string[];
  evidencias: string[];

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface FindingCreate {
  proyectoId: string;

  nombre: string;
  codigo: string;

  descripcion?: string;
  criterio?: string;
  objetivo?: string;
  causa?: string;
  efecto?: string;
  conclusion?: string;

  impacto: number;
  urgencia: number;

  justificacionRiesgo?: string;
  recomendaciones?: string;

  subrayados?: string[];
}

export interface FindingUpdate {
  nombre?: string;
  codigo?: string;

  descripcion?: string;
  criterio?: string;
  objetivo?: string;
  causa?: string;
  efecto?: string;
  conclusion?: string;

  impacto?: number;
  urgencia?: number;

  justificacionRiesgo?: string;
  recomendaciones?: string;

  subrayados?: string[];
  evidencias?: string[];
}