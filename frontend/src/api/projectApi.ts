import { axiosClient } from "./axiosClient";
import { Project, ProjectCreate, ProjectUpdate } from "../types/project";

export const projectApi = {
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await axiosClient.post<Project>("/projects/", data);
    return response.data;
  },

  getAll: async (): Promise<Project[]> => {
    const response = await axiosClient.get<Project[]>("/projects/");
    return response.data;
  },

  getById: async (projectId: string): Promise<Project> => {
    const response = await axiosClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  update: async (projectId: string, data: ProjectUpdate): Promise<Project> => {
    const response = await axiosClient.put<Project>(
      `/projects/${projectId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/projects/${projectId}`
    );
    return response.data;
  },
};