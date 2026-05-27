import { axiosClient } from "./axiosClient";
import { Finding, FindingCreate, FindingUpdate } from "../types/finding";

export interface FindingFromHighlightCreate {
  proyectoId: string;
  documentoId: string;

  textoSubrayado: string;
  subtitulo?: string;
  observacion?: string;

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
}

export const findingApi = {
  create: async (data: FindingCreate): Promise<Finding> => {
    const response = await axiosClient.post<Finding>("/findings/", data);
    return response.data;
  },

  createFromHighlight: async (data: FindingFromHighlightCreate) => {
    const response = await axiosClient.post("/findings/from-highlight", data);
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Finding[]> => {
    const response = await axiosClient.get<Finding[]>(
      `/findings/project/${projectId}`
    );
    return response.data;
  },

  getById: async (findingId: string): Promise<Finding> => {
    const response = await axiosClient.get<Finding>(`/findings/${findingId}`);
    return response.data;
  },

  update: async (
    findingId: string,
    data: FindingUpdate
  ): Promise<Finding> => {
    const response = await axiosClient.put<Finding>(
      `/findings/${findingId}`,
      data
    );
    return response.data;
  },

  delete: async (findingId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/findings/${findingId}`
    );
    return response.data;
  },

  downloadPdfUrl: (findingId: string): string => {
    return `${process.env.REACT_APP_API_URL}/findings/${findingId}/export-pdf`;
  },

  downloadWordUrl: (findingId: string): string => {
    return `${process.env.REACT_APP_API_URL}/findings/${findingId}/export-word`;
  },
};