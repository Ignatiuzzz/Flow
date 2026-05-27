import { axiosClient } from "./axiosClient";

export interface HealthResponse {
    status: string;
    message: string;
}

export const healthApi = {
    checkBackend: async (): Promise<HealthResponse> => {
        const response = await axiosClient.get<HealthResponse>("/health/");
        return response.data;
    },

    checkDatabase: async (): Promise<HealthResponse> => {
        const response = await axiosClient.get<HealthResponse>("/health/db");
        return response.data;
    },
};