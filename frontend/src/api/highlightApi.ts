import { axiosClient } from "./axiosClient";
import { Highlight, HighlightRelations } from "../types/highlight";

export const highlightApi = {
  getByDocument: async (documentId: string): Promise<Highlight[]> => {
    const response = await axiosClient.get<Highlight[]>(
      `/highlights/document/${documentId}`
    );

    return response.data;
  },

  getByProject: async (projectId: string): Promise<Highlight[]> => {
    const response = await axiosClient.get<Highlight[]>(
      `/highlights/project/${projectId}`
    );

    return response.data;
  },

  getRelations: async (highlightId: string): Promise<HighlightRelations> => {
    const response = await axiosClient.get<HighlightRelations>(
      `/highlights/${highlightId}/relations`
    );

    return response.data;
  },

  delete: async (highlightId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/highlights/${highlightId}`
    );

    return response.data;
  },
};