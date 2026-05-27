import { axiosClient } from "./axiosClient";
import { Finding, FindingCreate, FindingUpdate } from "../types/finding";

export const findingApi = {
  create: async (data: FindingCreate): Promise<Finding> => {
    const response = await axiosClient.post<Finding>("/findings/", data);
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