import apiClient from "@/lib/axios";
import { ApiResponse, Profile, UpdateProfilePayload } from "@/types";

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<Profile>>("/profile");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await apiClient.put<ApiResponse<Profile>>(
      "/profile",
      payload,
    );
    return response.data;
  },
};
