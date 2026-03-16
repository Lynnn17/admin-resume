import apiClient from "@/lib/axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const fileService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ data: string }>(
      "/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.data;
  },

  getFileUrl: (path: string) =>
    `/api/files?path=/files/${encodeURIComponent(path)}`,

  getImageUrl: (path: string, size?: string) => {
    const base = `/files/${encodeURIComponent(path)}`;
    return size ? `${base}?size=${size}` : base;
  },
};
