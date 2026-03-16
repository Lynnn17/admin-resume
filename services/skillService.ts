import apiClient from "@/lib/axios";
import {
  ApiResponse,
  SkillCategory,
  SkillItem,
  SkillCategoryPayload,
  SkillItemPayload,
} from "@/types";

export const skillService = {
  getAll: async () => {
    const response =
      await apiClient.get<ApiResponse<SkillCategory[]>>("/skills");
    return response.data;
  },

  getCategories: async () => {
    const response =
      await apiClient.get<ApiResponse<SkillCategory[]>>("/skills/categories");
    return response.data;
  },

  createCategory: async (payload: SkillCategoryPayload) => {
    const response = await apiClient.post<ApiResponse<SkillCategory>>(
      "/skills/categories",
      payload,
    );
    return response.data;
  },

  updateCategory: async (id: number, payload: SkillCategoryPayload) => {
    const response = await apiClient.put<ApiResponse<SkillCategory>>(
      `/skills/categories/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/skills/categories/${id}`,
    );
    return response.data;
  },

  createSkill: async (payload: SkillItemPayload) => {
    const response = await apiClient.post<ApiResponse<SkillItem>>(
      "/skills",
      payload,
    );
    return response.data;
  },

  updateSkill: async (id: number, payload: SkillItemPayload) => {
    const response = await apiClient.put<ApiResponse<SkillItem>>(
      `/skills/${id}`,
      payload,
    );
    return response.data;
  },

  deleteSkill: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/skills/${id}`);
    return response.data;
  },
};
