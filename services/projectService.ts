import apiClient from "@/lib/axios";
import { ApiResponse, Project, ProjectPayload } from "@/types";

export const projectService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${id}`,
    );
    return response.data;
  },

  create: async (payload: ProjectPayload) => {
    const response = await apiClient.post<ApiResponse<Project>>(
      "/projects",
      payload,
    );
    return response.data;
  },

  update: async (id: number, payload: ProjectPayload) => {
    const response = await apiClient.put<ApiResponse<Project>>(
      `/projects/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/projects/${id}`,
    );
    return response.data;
  },
};
