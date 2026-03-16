import apiClient from "@/lib/axios";
import {
  ApiResponse,
  LoginPayload,
  LoginResponseData,
  User,
  UserListParams,
  PaginatedResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types";

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload,
    );
    return response.data;
  },

  getUsers: async (params?: UserListParams) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      "/auth/user",
      { params },
    );
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>("/auth/user/all");
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/auth/user/${id}`);
    return response.data;
  },

  createUser: async (payload: CreateUserPayload) => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/auth/user",
      payload,
    );
    return response.data;
  },

  updateUser: async (payload: UpdateUserPayload) => {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/user",
      payload,
    );
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/auth/user/${id}`,
    );
    return response.data;
  },
};
