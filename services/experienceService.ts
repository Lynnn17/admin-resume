import apiClient from "@/lib/axios";
import { ApiResponse, Experience, ExperiencePayload } from "@/types";

export const experienceService = {
  getAll: async () => {
    const response =
      await apiClient.get<ApiResponse<Experience[]>>("/experiences");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Experience>>(
      `/experiences/${id}`,
    );
    return response.data;
  },

  create: async (payload: ExperiencePayload) => {
    const response = await apiClient.post<ApiResponse<Experience>>(
      "/experiences",
      payload,
    );
    return response.data;
  },

  update: async (id: number, payload: ExperiencePayload) => {
    const response = await apiClient.put<ApiResponse<Experience>>(
      `/experiences/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/experiences/${id}`,
    );
    return response.data;
  },
};
