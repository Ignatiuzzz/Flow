import { axiosClient } from "./axiosClient";
import {
  Evidence,
  EvidenceCreate,
  EvidenceUpdate,
} from "../types/evidence";

export const evidenceApi = {
  create: async (data: EvidenceCreate): Promise<Evidence> => {
    const response = await axiosClient.post<Evidence>("/evidences/", data);
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Evidence[]> => {
    const response = await axiosClient.get<Evidence[]>(
      `/evidences/project/${projectId}`
    );
    return response.data;
  },

  getByFinding: async (findingId: string): Promise<Evidence[]> => {
    const response = await axiosClient.get<Evidence[]>(
      `/evidences/finding/${findingId}`
    );
    return response.data;
  },

  getById: async (evidenceId: string): Promise<Evidence> => {
    const response = await axiosClient.get<Evidence>(
      `/evidences/${evidenceId}`
    );
    return response.data;
  },

  update: async (
    evidenceId: string,
    data: EvidenceUpdate
  ): Promise<Evidence> => {
    const response = await axiosClient.put<Evidence>(
      `/evidences/${evidenceId}`,
      data
    );
    return response.data;
  },

  delete: async (evidenceId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/evidences/${evidenceId}`
    );
    return response.data;
  },

  downloadPdfUrl: (evidenceId: string): string => {
    return `${process.env.REACT_APP_API_URL}/evidences/${evidenceId}/export-pdf`;
  },

  downloadWordUrl: (evidenceId: string): string => {
    return `${process.env.REACT_APP_API_URL}/evidences/${evidenceId}/export-word`;
  },
};