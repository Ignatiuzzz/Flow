import { axiosClient } from "./axiosClient";
import { AuditDocument } from "../types/document";

export const documentApi = {
  upload: async (projectId: string, file: File): Promise<AuditDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<AuditDocument>(
      `/documents/upload/${projectId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  getByProject: async (projectId: string): Promise<AuditDocument[]> => {
    const response = await axiosClient.get<AuditDocument[]>(
      `/documents/project/${projectId}`
    );

    return response.data;
  },

  getById: async (documentId: string): Promise<AuditDocument> => {
    const response = await axiosClient.get<AuditDocument>(
      `/documents/${documentId}`
    );

    return response.data;
  },

  delete: async (documentId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/documents/${documentId}`
    );

    return response.data;
  },

  fileUrl: (documentId: string): string => {
    return `${process.env.REACT_APP_API_URL}/documents/${documentId}/file`;
  },
};