import { axiosClient } from "./axiosClient";
import { ProjectMatrix } from "../types/matrix";

export const matrixApi = {
  getByProject: async (projectId: string): Promise<ProjectMatrix> => {
    const response = await axiosClient.get<ProjectMatrix>(
      `/matrix/project/${projectId}`
    );

    return response.data;
  },

  downloadExcelUrl: (projectId: string): string => {
    return `${process.env.REACT_APP_API_URL}/matrix/project/${projectId}/export-excel`;
  },
};