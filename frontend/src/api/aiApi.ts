import { axiosClient } from "./axiosClient";

export interface AISuggestFindingRequest {
  proyectoId: string;
  documentoId?: string;
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  textoSubrayado?: string;
  camposExistentes?: Record<string, string>;
}

export interface AISuggestEvidenceRequest {
  proyectoId: string;
  hallazgoId?: string;
  nombre?: string;
  descripcionEvidencia?: string;
  camposExistentes?: Record<string, string>;
}

export interface AISuggestFromHighlightRequest {
  textoSubrayado: string;
  tipo: "hallazgo" | "evidencia";
  proyectoId?: string;
  documentoId?: string;
}

export interface AIImproveTextRequest {
  texto: string;
  nombreCampo: string;
  contexto?: string;
}

export interface AISuggestionResponse {
  sugerencias: Record<string, string>;
  mensaje?: string;
}

export interface AIImproveTextResponse {
  textoMejorado: string;
  mensaje?: string;
}

export const aiApi = {
  suggestFinding: async (
    data: AISuggestFindingRequest
  ): Promise<AISuggestionResponse> => {
    const response = await axiosClient.post("/ai/suggest-finding", data);
    return response.data;
  },

  suggestEvidence: async (
    data: AISuggestEvidenceRequest
  ): Promise<AISuggestionResponse> => {
    const response = await axiosClient.post("/ai/suggest-evidence", data);
    return response.data;
  },

  suggestFromHighlight: async (
    data: AISuggestFromHighlightRequest
  ): Promise<AISuggestionResponse> => {
    const response = await axiosClient.post("/ai/suggest-from-highlight", data);
    return response.data;
  },

  improveText: async (
    data: AIImproveTextRequest
  ): Promise<AIImproveTextResponse> => {
    const response = await axiosClient.post("/ai/improve-text", data);
    return response.data;
  },
};
